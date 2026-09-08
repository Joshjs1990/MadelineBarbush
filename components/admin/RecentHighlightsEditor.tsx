"use client";

import { useEffect, useState } from "react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

export function RecentHighlightsEditor({ compact = false }: { compact?: boolean }) {
  const [busy, setBusy] = useState(true);
  const [status, setStatus] = useState("");
  const [html, setHtml] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    const load = async () => {
      try {
        const response = await fetch("/api/admin/recent-highlights", { signal: controller.signal });
        const body = await response.json().catch(() => ({})) as { data?: { html?: string }; error?: string };
        if (response.ok) setHtml(body.data?.html ?? "");
        else setStatus(body.error ?? `Highlights could not be loaded (${response.status}).`);
      } catch { setStatus("Highlights could not be loaded. Check your connection and try again."); }
      finally { window.clearTimeout(timeout); setBusy(false); }
    };
    void load();
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, []);

  const save = async () => {
    setBusy(true); setStatus("Saving highlights…");
    try {
      const response = await fetch("/api/admin/recent-highlights", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ html }) });
      const body = await response.json().catch(() => ({})) as { error?: string };
      setStatus(response.ok ? "Recent highlights saved." : (body.error ?? "Highlights could not be saved."));
    } catch { setStatus("Highlights could not be saved. Check your connection and try again."); }
    finally { setBusy(false); }
  };

  const editor = <>
    <RichTextEditor value={html} onChange={setHtml} />
    {status ? <p className="admin-form-status" role="status">{status}</p> : null}
    <button className="admin-page-editor__save" type="button" onClick={() => void save()} disabled={busy}>{busy ? "Loading…" : "Save page"}</button>
  </>;

  if (compact) return <div className="admin-page-editor__rich-content">{editor}</div>;
  return <div className="admin-dashboard-section admin-highlights-editor"><div className="admin-section-heading"><div><p className="eyebrow">Public page</p><h2>Recent Highlights</h2><p>Edit the content shown on the Recent Highlights page.</p></div></div>{editor}</div>;
}
