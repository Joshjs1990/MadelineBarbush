"use client";

import { useEffect, useState } from "react";

type Placement = "showreel" | "showreel-image" | "gallery" | "videos-page" | "work-page";
type Asset = { key: string; size: number; contentType: string; url: string | null; title?: string; placements: Placement[] };

const placementLabels: Record<Placement, string> = {
  showreel: "Homepage showreel",
  "showreel-image": "Showreel image",
  gallery: "Photos page",
  "videos-page": "Videos page",
  "work-page": "Work page",
};

export function MediaLibrary() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [status, setStatus] = useState("Loading media");
  const [busy, setBusy] = useState(false);
  const [youtubeTitle, setYoutubeTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const load = async () => {
    const response = await fetch("/api/admin/media");
    const body = (await response.json().catch(() => ({}))) as { data?: Asset[]; error?: string };

    if (!response.ok) {
      setStatus(body.error ?? "Unable to load media");
      return;
    }

    setAssets(body.data ?? []);
    setStatus("Media library");
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const start = await fetch("/api/admin/media/uploads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type }),
      });
      const created = (await start.json()) as {
        data?: { key: string; uploadId: string; partSize: number };
        error?: string;
      };
      if (!start.ok || !created.data) throw new Error(created.error);

      const parts: Array<{ partNumber: number; etag: string }> = [];
      for (let offset = 0, partNumber = 1; offset < file.size; offset += created.data.partSize, partNumber += 1) {
        setStatus(`Uploading ${Math.round(Math.min(100, ((offset + created.data.partSize) / file.size) * 100))}%`);
        const response = await fetch(
          `/api/admin/media/uploads/${created.data.uploadId}?key=${encodeURIComponent(created.data.key)}&partNumber=${partNumber}`,
          { method: "PUT", body: file.slice(offset, offset + created.data.partSize) },
        );
        const body = (await response.json()) as { data?: { etag: string }; error?: string };
        if (!response.ok || !body.data) throw new Error(body.error);
        parts.push({ partNumber, etag: body.data.etag });
      }

      const complete = await fetch(`/api/admin/media/uploads/${created.data.uploadId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key: created.data.key, parts }),
      });
      if (!complete.ok) throw new Error("Unable to finish upload");
      await load();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const addYouTube = async () => {
    setBusy(true);
    const response = await fetch("/api/admin/media/external", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: youtubeTitle, url: youtubeUrl }) });
    const body = (await response.json().catch(() => ({}))) as { data?: Asset; error?: string };
    setBusy(false);
    if (!response.ok || !body.data) {
      setStatus(body.error ?? "Unable to add YouTube video");
      return;
    }
    setAssets((current) => [...current, body.data!]);
    setYoutubeTitle("");
    setYoutubeUrl("");
    setStatus("YouTube video added");
  };

  const remove = async (key: string) => {
    if (!window.confirm("Delete this media file? It cannot be restored.")) return;
    const response = await fetch(`/api/admin/media?key=${encodeURIComponent(key)}`, { method: "DELETE" });
    if (!response.ok) {
      setStatus("Unable to delete media");
      return;
    }
    await load();
  };

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("URL copied");
    } catch {
      setStatus("Unable to copy URL");
    }
  };

  const place = async (key: string, placement: Placement, enabled: boolean) => {
    const response = await fetch("/api/admin/media/placement", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, placement, enabled }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setStatus(body.error ?? "Unable to save placement");
      return;
    }
    setAssets((current) => current.map((asset) => {
      if (asset.key !== key) return asset;
      const placements = enabled
        ? [...new Set([...asset.placements, placement])]
        : asset.placements.filter((item) => item !== placement);
      return { ...asset, placements };
    }));
    setStatus(enabled ? "Placement added" : "Placement removed");
  };

  return (
    <div className="admin-editor">
      <section className="admin-section">
        <div>
          <p className="eyebrow">R2 media</p>
          <h2>Upload</h2>
          <p className="admin-auth-hint">Video and image files upload in 8 MB parts.</p>
        </div>
        <div className="admin-fields">
          <label className="admin-field-wide">
            <span>Video or image</span>
            <input type="file" accept="video/*,image/*" disabled={busy} onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }} />
          </label>
          <p className="admin-media-status" role="status">{status}</p>
        </div>
      </section>

      <section className="admin-section">
        <div>
          <p className="eyebrow">YouTube</p>
          <h2>Add video</h2>
          <p className="admin-auth-hint">Add a YouTube link, then choose where it should play.</p>
        </div>
        <div className="admin-fields">
          <label>
            <span>Title</span>
            <input value={youtubeTitle} onChange={(event) => setYoutubeTitle(event.target.value)} placeholder="Showreel" />
          </label>
          <label className="admin-field-wide">
            <span>YouTube URL</span>
            <input value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} placeholder="https://youtu.be/..." />
          </label>
          <button type="button" disabled={busy || !youtubeUrl.trim()} onClick={() => void addYouTube()}>Add YouTube video</button>
        </div>
      </section>

      <section className="admin-section">
        <div>
          <p className="eyebrow">Files</p>
          <h2>Library</h2>
        </div>
        <div className="admin-media-list">
          {assets.length ? assets.map((asset) => {
            const isVideo = asset.contentType.startsWith("video/");
            const isYouTube = asset.contentType === "video/youtube";
            const availablePlacements: Placement[] = isVideo
              ? ["showreel", "videos-page", "work-page"]
              : ["showreel-image", "gallery", "work-page"];
            return (
              <article className="admin-media-row" key={asset.key}>
                <div className="admin-media-row__thumb" aria-hidden="true">
                  {asset.url && !isVideo ? <img src={asset.url} alt="" loading="lazy" /> : null}
                  {asset.url && isVideo && !isYouTube ? <video src={asset.url} muted playsInline preload="metadata" /> : null}
                </div>
                <div className="admin-media-row__info">
                  <strong>{asset.title ?? asset.key.split("/").at(-1)}</strong>
                  <span>{(asset.size / 1024 / 1024).toFixed(1)} MB · {asset.contentType || "Unknown type"}</span>
                </div>
                <div className="admin-media-row__actions">
                  {asset.url ? <button type="button" onClick={() => void copy(asset.url!)}>Copy URL</button> : null}
                  <fieldset className="admin-media-placements">
                    <legend>Display on</legend>
                    {availablePlacements.map((placement) => (
                      <label key={placement}>
                        <input type="checkbox" checked={asset.placements.includes(placement)} onChange={(event) => void place(asset.key, placement, event.target.checked)} />
                        <span>{placementLabels[placement]}</span>
                      </label>
                    ))}
                  </fieldset>
                  <button className="admin-media-row__delete" type="button" onClick={() => void remove(asset.key)}>Delete</button>
                </div>
              </article>
            );
          }) : <p className="admin-empty">No media uploaded yet.</p>}
        </div>
      </section>
    </div>
  );
}
