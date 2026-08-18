"use client";

import { useEffect, useState } from "react";

type Placement = "showreel" | "showreel-image" | "gallery";
type Asset = { key: string; size: number; contentType: string; url: string | null; placements: Placement[] };

const placementLabels: Record<Placement, string> = {
  showreel: "Homepage showreel",
  "showreel-image": "Showreel image",
  gallery: "Photos page",
};

export function MediaLibrary() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [status, setStatus] = useState("Loading media");
  const [busy, setBusy] = useState(false);

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

  const place = async (key: string, placement: Placement) => {
    const response = await fetch("/api/admin/media/placement", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, placement }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setStatus(response.ok ? "Placement saved" : body.error ?? "Unable to save placement");
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
          <p className="eyebrow">Files</p>
          <h2>Library</h2>
        </div>
        <div className="admin-media-list">
          {assets.length ? assets.map((asset) => {
            const isVideo = asset.contentType.startsWith("video/");
            return (
              <article className="admin-media-row" key={asset.key}>
                <div className="admin-media-row__thumb" aria-hidden="true">
                  {asset.url && !isVideo ? <img src={asset.url} alt="" loading="lazy" /> : null}
                  {asset.url && isVideo ? <video src={asset.url} muted playsInline preload="metadata" /> : null}
                </div>
                <div className="admin-media-row__info">
                  <strong>{asset.key.split("/").at(-1)}</strong>
                  <span>{(asset.size / 1024 / 1024).toFixed(1)} MB · {asset.contentType || "Unknown type"}</span>
                </div>
                <div className="admin-media-row__actions">
                  {asset.url ? <button type="button" onClick={() => void copy(asset.url!)}>Copy URL</button> : null}
                  <label>
                    <span className="sr-only">Display this file on</span>
                    <select defaultValue="" onChange={(event) => {
                      if (event.target.value) void place(asset.key, event.target.value as Placement);
                      event.target.value = "";
                    }}>
                      <option value="">{asset.placements.length ? `On: ${asset.placements.map((placement) => placementLabels[placement]).join(" · ")}` : "Display on..."}</option>
                      {isVideo ? <option value="showreel">Homepage showreel</option> : null}
                      {!isVideo ? <option value="showreel-image">Showreel image</option> : null}
                      {!isVideo ? <option value="gallery">Photos page</option> : null}
                    </select>
                  </label>
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
