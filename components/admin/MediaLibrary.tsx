"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import { getYouTubeThumbnailUrl } from "@/lib/media/youtube";

type Placement = "showreel" | "showreel-image" | "gallery" | "performance-stills" | "videos-page" | "work-page";
type Asset = { key: string; size: number; contentType: string; url: string | null; title?: string; thumbnailUrl?: string | null; placements: Placement[] };
type AddMode = "video" | "photo";

const placementLabels: Record<Placement, string> = { showreel: "Homepage showreel", "showreel-image": "Homepage image", gallery: "Photos page", "performance-stills": "Performance stills", "videos-page": "Video page", "work-page": "Work page" };
function defaultTitle(fileName: string) { return fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim(); }

export function MediaLibrary() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [status, setStatus] = useState("Loading media library…");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<AddMode>("video");
  const [view, setView] = useState<AddMode>("video");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingTitle, setPendingTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeTitle, setYoutubeTitle] = useState("");
  const [draftTitles, setDraftTitles] = useState<Record<string, string>>({});
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const response = await fetch("/api/admin/media");
    const body = (await response.json().catch(() => ({}))) as { data?: Asset[]; error?: string };
    if (!response.ok) { setStatus(body.error ?? "Unable to load media"); return; }
    const nextAssets = body.data ?? [];
    setAssets(nextAssets);
    setDraftTitles(Object.fromEntries(nextAssets.map((asset) => [asset.key, asset.title ?? ""])));
    setStatus(`${nextAssets.length} media item${nextAssets.length === 1 ? "" : "s"} in your library`);
  };

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, []);
  const filteredAssets = useMemo(() => assets.filter((asset) => (asset.contentType.startsWith("video/") ? view === "video" : view === "photo")), [assets, view]);

  const saveMetadata = async (key: string, title: string) => {
    const response = await fetch("/api/admin/media/metadata", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key, title }) });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) { setStatus(body.error ?? "Unable to save the media name"); return false; }
    setAssets((current) => current.map((asset) => asset.key === key ? { ...asset, title } : asset)); setStatus("Media name saved"); return true;
  };

  const savePlacement = async (key: string, placement: Placement, enabled: boolean) => {
    const response = await fetch("/api/admin/media/placement", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key, placement, enabled }) });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) { setStatus(body.error ?? "Unable to save placement"); return false; }
    setAssets((current) => current.map((asset) => asset.key === key ? { ...asset, placements: enabled ? [...new Set([...asset.placements, placement])] : asset.placements.filter((item) => item !== placement) } : asset)); setStatus(enabled ? "Added to page" : "Removed from page"); return true;
  };

  const upload = async () => {
    if (!pendingFile) return;
    setBusy(true);
    try {
      const start = await fetch("/api/admin/media/uploads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fileName: pendingFile.name, contentType: pendingFile.type }) });
      const created = (await start.json()) as { data?: { key: string; uploadId: string; partSize: number }; error?: string };
      if (!start.ok || !created.data) throw new Error(created.error ?? "Unable to start upload");
      const parts: Array<{ partNumber: number; etag: string }> = [];
      for (let offset = 0, partNumber = 1; offset < pendingFile.size; offset += created.data.partSize, partNumber += 1) {
        setStatus(`Uploading ${Math.round(Math.min(100, ((offset + created.data.partSize) / pendingFile.size) * 100))}%…`);
        const response = await fetch(`/api/admin/media/uploads/${created.data.uploadId}?key=${encodeURIComponent(created.data.key)}&partNumber=${partNumber}`, { method: "PUT", body: pendingFile.slice(offset, offset + created.data.partSize) });
        const body = (await response.json()) as { data?: { etag: string }; error?: string };
        if (!response.ok || !body.data) throw new Error(body.error ?? "Upload failed");
        parts.push({ partNumber, etag: body.data.etag });
      }
      const complete = await fetch(`/api/admin/media/uploads/${created.data.uploadId}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: created.data.key, parts }) });
      if (!complete.ok) throw new Error("Unable to finish upload");
      await saveMetadata(created.data.key, pendingTitle || defaultTitle(pendingFile.name));
      await savePlacement(created.data.key, mode === "video" ? "work-page" : "gallery", true);
      setPendingFile(null); setPendingTitle(""); if (fileInputRef.current) fileInputRef.current.value = "";
      await load(); setStatus(`${mode === "video" ? "Video" : "Photo"} saved`);
    } catch (error) { setStatus(error instanceof Error ? error.message : "Upload failed"); }
    finally { setBusy(false); }
  };

  const addYouTube = async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/media/external", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: youtubeTitle, url: youtubeUrl }) });
      const body = (await response.json().catch(() => ({}))) as { data?: Asset; error?: string };
      if (!response.ok || !body.data) throw new Error(body.error ?? "Unable to add YouTube video");
      await savePlacement(body.data.key, "work-page", true); setYoutubeTitle(""); setYoutubeUrl(""); await load(); setStatus("Video saved");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Unable to add video"); }
    finally { setBusy(false); }
  };

  const saveOrder = async (next: Asset[]) => {
    setAssets(next);
    const response = await fetch("/api/admin/media/order", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ keys: next.map((asset) => asset.key) }) });
    if (!response.ok) { setStatus("Unable to save media order"); await load(); return; } setStatus("Order saved");
  };

  const moveBefore = async (movingKey: string, targetKey: string) => {
    if (movingKey === targetKey) return;
    const next = [...assets]; const from = next.findIndex((asset) => asset.key === movingKey); if (from < 0) return;
    const [moving] = next.splice(from, 1); next.splice(next.findIndex((asset) => asset.key === targetKey), 0, moving); await saveOrder(next);
  };
  const move = async (key: string, direction: -1 | 1) => { const index = filteredAssets.findIndex((asset) => asset.key === key); const target = filteredAssets[index + direction]; if (target) await moveBefore(key, target.key); };
  const remove = async (key: string) => { if (!window.confirm("Delete this media file? It cannot be restored.")) return; const response = await fetch(`/api/admin/media?key=${encodeURIComponent(key)}`, { method: "DELETE" }); if (!response.ok) { setStatus("Unable to delete media"); return; } await load(); setStatus("Media deleted"); };
  const selectMode = (nextMode: AddMode) => { setMode(nextMode); setPendingFile(null); setPendingTitle(""); if (fileInputRef.current) fileInputRef.current.value = ""; };

  return <div className="admin-media-manager">
    <section className="admin-media-add"><div className="admin-media-add__intro"><p className="eyebrow">Add media</p><h2>Build your library.</h2><p>Choose a video or photo, give it a clear name, then save it. New items are added to the matching public page automatically.</p></div><div className="admin-media-add__panel">
      <div className="admin-media-tabs" role="tablist" aria-label="Add media type"><button type="button" className={mode === "video" ? "is-active" : ""} onClick={() => selectMode("video")}>Add a video</button><button type="button" className={mode === "photo" ? "is-active" : ""} onClick={() => selectMode("photo")}>Add a photo</button></div>
      {mode === "video" ? <><label className="admin-media-upload-choice"><span>Upload a video file</span><input ref={fileInputRef} type="file" accept="video/*" disabled={busy} onChange={(event) => { const file = event.target.files?.[0] ?? null; setPendingFile(file); setPendingTitle(file ? defaultTitle(file.name) : ""); }} /></label><div className="admin-media-or"><span>or add a YouTube video</span></div><div className="admin-media-form-grid"><label><span>Video name</span><input value={youtubeTitle} onChange={(event) => setYoutubeTitle(event.target.value)} placeholder="Showreel" /></label><label><span>YouTube URL</span><input value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} placeholder="https://youtu.be/..." /></label></div>{getYouTubeThumbnailUrl(youtubeUrl) ? <img className="admin-youtube-preview" src={getYouTubeThumbnailUrl(youtubeUrl)!} alt="YouTube thumbnail preview" /> : null}</> : <label className="admin-media-upload-choice"><span>Choose a photo file</span><input ref={fileInputRef} type="file" accept="image/*" disabled={busy} onChange={(event) => { const file = event.target.files?.[0] ?? null; setPendingFile(file); setPendingTitle(file ? defaultTitle(file.name) : ""); }} /></label>}
      {pendingFile ? <label className="admin-media-title-field"><span>Name shown on the site</span><input value={pendingTitle} onChange={(event) => setPendingTitle(event.target.value)} /></label> : null}<button className="admin-media-save" type="button" disabled={busy || (mode === "video" ? (!pendingFile && !youtubeUrl.trim()) : !pendingFile)} onClick={() => void (mode === "video" && !pendingFile && youtubeUrl.trim() ? addYouTube() : upload())}>{busy ? "Saving…" : `Save ${mode}`}</button><p className="admin-media-status" role="status">{status}</p>
    </div></section>
    <section className="admin-media-library"><div className="admin-media-library__header"><div><p className="eyebrow">Your collection</p><h2>Media library</h2><p>Drag cards to change the order. That order is used on the public pages.</p></div><div className="admin-media-view-tabs" role="tablist" aria-label="Media type"><button type="button" className={view === "video" ? "is-active" : ""} onClick={() => setView("video")}>Videos <span>{assets.filter((asset) => asset.contentType.startsWith("video/")).length}</span></button><button type="button" className={view === "photo" ? "is-active" : ""} onClick={() => setView("photo")}>Photos <span>{assets.filter((asset) => !asset.contentType.startsWith("video/")).length}</span></button></div></div>
      {filteredAssets.length ? <div className="admin-media-grid">{filteredAssets.map((asset) => { const isVideo = asset.contentType.startsWith("video/"); const isYouTube = asset.contentType === "video/youtube"; const availablePlacements: Placement[] = isVideo ? ["work-page", "videos-page", "showreel"] : ["gallery", "showreel-image"]; const visibleIndex = filteredAssets.findIndex((item) => item.key === asset.key); return <article className={`admin-media-card${draggingKey === asset.key ? " is-dragging" : ""}`} key={asset.key} draggable onDragStart={() => setDraggingKey(asset.key)} onDragEnd={() => setDraggingKey(null)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (draggingKey) void moveBefore(draggingKey, asset.key); setDraggingKey(null); }}><div className="admin-media-card__preview">{isYouTube && asset.thumbnailUrl ? <img src={asset.thumbnailUrl} alt="" loading="lazy" /> : asset.url && !isVideo ? <img src={asset.url} alt="" loading="lazy" /> : asset.url ? <video src={asset.url} muted playsInline preload="metadata" /> : null}<span className="admin-media-card__drag">Drag</span></div><div className="admin-media-card__body"><input className="admin-media-card__title" aria-label={`Name for ${asset.title ?? "media"}`} value={draftTitles[asset.key] ?? asset.title ?? ""} onChange={(event) => setDraftTitles((current) => ({ ...current, [asset.key]: event.target.value }))} /><div className="admin-media-card__meta">{isYouTube ? "YouTube video" : `${(asset.size / 1024 / 1024).toFixed(1)} MB`} · {asset.contentType}</div><div className="admin-media-card__actions"><button type="button" onClick={() => void saveMetadata(asset.key, draftTitles[asset.key] ?? asset.title ?? "")}>Save name</button><button type="button" disabled={visibleIndex === 0} onClick={() => void move(asset.key, -1)} aria-label="Move media earlier">↑</button><button type="button" disabled={visibleIndex === filteredAssets.length - 1} onClick={() => void move(asset.key, 1)} aria-label="Move media later">↓</button><button className="is-danger" type="button" onClick={() => void remove(asset.key)}>Delete</button></div><fieldset className="admin-media-card__placements"><legend>Show on</legend>{availablePlacements.map((placement) => <label key={placement}><input type="checkbox" checked={asset.placements.includes(placement)} onChange={(event) => void savePlacement(asset.key, placement, event.target.checked)} /><span>{placementLabels[placement]}</span></label>)}</fieldset></div></article>; })}</div> : <div className="admin-media-empty"><strong>No {view === "video" ? "videos" : "photos"} yet.</strong><span>Use the add panel above to save your first one.</span></div>}
    </section>
  </div>;
}
