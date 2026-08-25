"use client";

import { useEffect, useRef, useState } from "react";

export function RecentHighlightsEditor({ compact = false }: { compact?: boolean }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    const load = async () => {
      try {
        const response = await fetch("/api/admin/recent-highlights", { signal: controller.signal });
        const body = await response.json().catch(() => ({})) as { data?: { html?: string }; error?: string };
        if (response.ok && editorRef.current) editorRef.current.innerHTML = body.data?.html ?? "";
        else setStatus(body.error ?? `Highlights could not be loaded (${response.status}).`);
      } catch { setStatus("Highlights could not be loaded. Check your connection and try again."); }
      finally { window.clearTimeout(timeout); setBusy(false); }
    };
    void load();
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, []);

  const command = (name: string, value?: string) => { editorRef.current?.focus(); document.execCommand(name, false, value); };
  const save = async () => {
    if (!editorRef.current) return;
    setBusy(true); setStatus("Saving highlights…");
    try {
      const response = await fetch("/api/admin/recent-highlights", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ html: editorRef.current.innerHTML }) });
      const body = await response.json().catch(() => ({})) as { error?: string };
      setStatus(response.ok ? "Recent highlights saved." : (body.error ?? "Highlights could not be saved."));
    } catch { setStatus("Highlights could not be saved. Check your connection and try again."); }
    finally { setBusy(false); }
  };

  const editor = <>
    <div className="admin-rich-toolbar" role="toolbar" aria-label="Recent highlights formatting">
      <button type="button" onClick={() => command("formatBlock", "h2")}>H2</button>
      <button type="button" onClick={() => command("bold")}><strong>B</strong></button>
      <button type="button" onClick={() => command("italic")}><em>I</em></button>
      <button type="button" onClick={() => command("insertUnorderedList")}>• List</button>
      <button type="button" onClick={() => { const url = window.prompt("Link URL:"); if (url) command("createLink", url.trim()); }}>↗ Link</button>
      <button type="button" onClick={() => command("undo")} disabled={busy}>↩</button>
      <button type="button" onClick={() => command("redo")} disabled={busy}>↪</button>
    </div>
    <div ref={editorRef} className="admin-rich-editor" contentEditable={!busy} suppressContentEditableWarning role="textbox" aria-label="Recent highlights content" aria-multiline="true" />
    {status ? <p className="admin-form-status" role="status">{status}</p> : null}
    <button className="admin-page-editor__save" type="button" onClick={() => void save()} disabled={busy}>{busy ? "Loading…" : "Save page"}</button>
  </>;

  if (compact) return <div className="admin-page-editor__rich-content">{editor}</div>;
  return <div className="admin-dashboard-section admin-highlights-editor"><div className="admin-section-heading"><div><p className="eyebrow">Public page</p><h2>Recent Highlights</h2><p>Edit the content shown on the Recent Highlights page.</p></div></div>{editor}</div>;
}
