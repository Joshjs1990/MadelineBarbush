"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toYouTubeEmbedUrl } from "@/lib/media/youtube";
import type { Showreel } from "@/lib/site-settings/showreel";

export function ShowreelEditor({ showreel }: { showreel: Showreel }) {
  const router = useRouter();
  const [draft, setDraft] = useState(showreel);
  const [status, setStatus] = useState("Editing");
  const [busy, setBusy] = useState(false);

  const update = (key: keyof Showreel, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const embedUrl = draft.videoUrl.trim() ? toYouTubeEmbedUrl(draft.videoUrl.trim()) : null;
  const badUrl = Boolean(draft.videoUrl.trim()) && !embedUrl;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setStatus("Saving");

    const response = await fetch("/api/admin/showreel", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(draft),
    });

    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setBusy(false);

    if (!response.ok) {
      setStatus(body.error ?? "Unable to save");
      return;
    }

    setStatus("Saved");
    router.refresh();
  };

  return (
    <form className="admin-editor" onSubmit={submit}>
      <section className="admin-section">
        <div>
          <p className="eyebrow">Homepage</p>
          <h2>Showreel</h2>
          <p className="admin-auth-hint">
            Paste a YouTube link or direct public R2 video URL. Upload a new file in the Media library.
          </p>
        </div>
        <div className="admin-fields">
          <label>
            <span>Corner label</span>
            <input value={draft.label} onChange={(event) => update("label", event.target.value)} />
          </label>
          <label>
            <span>Placeholder headline</span>
            <input value={draft.title} onChange={(event) => update("title", event.target.value)} />
          </label>
          <label className="admin-field-wide">
            <span>Video URL</span>
            <input
              value={draft.videoUrl}
              onChange={(event) => update("videoUrl", event.target.value)}
              placeholder="https://media.example.com/uploads/showreel.mp4"
              aria-invalid={badUrl || undefined}
            />
          </label>
          <label className="admin-field-wide">
            <span>Placeholder background image</span>
            <input
              value={draft.posterImage}
              onChange={(event) => update("posterImage", event.target.value)}
              placeholder="/images/actor-wide.jpg"
            />
          </label>
        </div>
      </section>

      <section className="admin-section">
        <div>
          <p className="eyebrow">Preview</p>
          <h2>Frame</h2>
        </div>
        <div className="admin-preview">
          {badUrl ? (
            <p className="admin-auth-error" role="alert">
              That is not a YouTube link the player can embed.
            </p>
          ) : null}

          {embedUrl ? (
            <iframe
              src={embedUrl}
              title="Showreel preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div
              className="admin-preview__frame"
              style={{ backgroundImage: `url("${draft.posterImage}")` }}
            >
              <span>{draft.label}</span>
              <strong>{draft.title}</strong>
            </div>
          )}
        </div>
      </section>

      <aside className="admin-publish">
        <div>
          <span>{status}</span>
          <strong>{embedUrl ? "Player" : "Placeholder"}</strong>
        </div>
        <div className="admin-publish__actions">
          <Link href="/admin/media">Media library</Link>
          <Link href="/">View homepage</Link>
          <button type="submit" disabled={busy || badUrl}>
            {busy ? "Saving…" : "Save showreel"}
          </button>
        </div>
      </aside>
    </form>
  );
}
