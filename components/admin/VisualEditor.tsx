"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { EDITABLE_FIELDS, fieldValue, setFieldValue, type EditableContent, type EditableFieldId } from "@/lib/assistant/registry";
import { richTextHtml } from "@/lib/content/rich-text";
import type { SiteImage, VisualMedia } from "@/lib/site-settings/media";

type Page = { label: string; path: string; fields: EditableFieldId[]; media?: string };
type Asset = { key: string; url: string | null; title?: string; contentType: string };

const pages: Page[] = [
  { label: "Home", path: "/", fields: ["home.heroHeading", "home.heroRole", "home.heroCopy"] , media: "homeHero" },
  { label: "Bio", path: "/bio", fields: ["about.heading", "about.intro", "about.body"], media: "bio" },
  { label: "Resume", path: "/resume", fields: ["pages.resumeHeading", "resume.intro", "resume.theater", "resume.stagedReadings", "resume.film", "resume.training", "resume.skills"], media: "resume" },
  { label: "Recent Highlights", path: "/recent-highlights", fields: ["pages.recentHighlightsHeading"], media: "recent" },
  { label: "Media", path: "/photos", fields: ["pages.photosHeading"] },
  { label: "Contact", path: "/contact", fields: ["pages.contactHeading", "contact.representation", "contact.note", "contact.formHeading"], media: "contact" },
  { label: "Performance Stills", path: "/performance-stills", fields: ["pages.performanceStillsHeading"] },
];

const mediaFields: Record<string, { label: string; slot: keyof VisualMedia }> = {
  "home.heroImage": { label: "Homepage image", slot: "homeHero" },
  "bio.image": { label: "Bio image", slot: "bio" },
  "resume.primaryImage": { label: "Large resume headshot", slot: "resumePrimary" },
  "resume.secondaryImage": { label: "Offset resume headshot", slot: "resumeSecondary" },
  "recentHighlights.primaryImage": { label: "Primary highlights photo", slot: "recentPrimary" },
  "recentHighlights.secondaryImage": { label: "Secondary highlights photo", slot: "recentSecondary" },
  "contact.image": { label: "Contact photo", slot: "contact" },
};

const labels: Record<string, string> = Object.fromEntries(Object.entries(EDITABLE_FIELDS).map(([id, field]) => [id, field.label]));

function contentValue(content: EditableContent, id: EditableFieldId) { return fieldValue(content, id); }

export function VisualEditor({ content, media }: { content: EditableContent; media: VisualMedia }) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const richEditorRef = useRef<HTMLDivElement>(null);
  const [pageLabel, setPageLabel] = useState("Home");
  const [selected, setSelected] = useState<string>("home.heroHeading");
  const [draft, setDraft] = useState(content);
  const [baseline, setBaseline] = useState(content);
  const [draftMedia, setDraftMedia] = useState(media);
  const [baselineMedia, setBaselineMedia] = useState(media);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [status, setStatus] = useState("Click any outlined text or image in the page preview to edit it.");
  const [busy, setBusy] = useState(false);
  const page = pages.find((entry) => entry.label === pageLabel) ?? pages[0];
  const selectedField = mediaFields[selected] ? null : selected as EditableFieldId;
  const selectedMedia = mediaFields[selected] ? draftMedia[mediaFields[selected].slot] : null;
  const selectedValue = selectedField ? contentValue(draft, selectedField) : "";
  const isRich = selectedField ? EDITABLE_FIELDS[selectedField]?.type === "richText" : false;

  const loadAssets = async () => {
    const response = await fetch("/api/admin/media", { cache: "no-store" });
    const body = await response.json().catch(() => ({})) as { data?: Asset[] };
    if (response.ok) setAssets((body.data ?? []).filter((asset) => asset.url && asset.contentType.startsWith("image/")));
  };

  useEffect(() => { const timer = window.setTimeout(() => void loadAssets(), 0); return () => window.clearTimeout(timer); }, []);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type === "editor-select" && (event.data.field in mediaFields || event.data.field in EDITABLE_FIELDS)) setSelected(event.data.field);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  useEffect(() => {
    if (!isRich || !richEditorRef.current) return;
    const html = richTextHtml(selectedValue);
    if (richEditorRef.current.innerHTML !== html) richEditorRef.current.innerHTML = html;
  }, [selected, isRich, selectedValue]);
  useEffect(() => {
    const values = Object.fromEntries(Object.values(EDITABLE_FIELDS).map((field) => [field.id, field.type === "richText" ? richTextHtml(fieldValue(draft, field.id)) : fieldValue(draft, field.id)]));
    const mediaValues = Object.fromEntries(Object.entries(draftMedia).map(([key, image]) => [key === "homeHero" ? "home.heroImage" : key === "resumePrimary" ? "resume.primaryImage" : key === "resumeSecondary" ? "resume.secondaryImage" : key === "recentPrimary" ? "recentHighlights.primaryImage" : key === "recentSecondary" ? "recentHighlights.secondaryImage" : `${key}.image`, image]));
    iframeRef.current?.contentWindow?.postMessage({ type: "editor-preview-all", values, media: mediaValues }, window.location.origin);
  }, [draft, draftMedia]);

  const selectPage = (next: string) => { setPageLabel(next); const nextPage = pages.find((entry) => entry.label === next); setSelected(nextPage?.fields[0] ?? "home.heroHeading"); };
  const setValue = (value: string) => { if (selectedField) setDraft((current) => setFieldValue(current, selectedField, value)); };
  const command = (name: string, value?: string) => { richEditorRef.current?.focus(); document.execCommand(name, false, value); if (richEditorRef.current) setValue(richEditorRef.current.innerHTML); };
  const updateImage = (patch: Partial<SiteImage>) => { if (!mediaFields[selected]) return; const slot = mediaFields[selected].slot; setDraftMedia((current) => ({ ...current, [slot]: { ...current[slot], ...patch } })); };

  const save = async () => {
    setBusy(true); setStatus("Saving changes…");
    try {
      const changes = (Object.keys(EDITABLE_FIELDS) as EditableFieldId[]).filter((id) => fieldValue(draft, id) !== fieldValue(baseline, id)).map((fieldId) => ({ fieldId, value: fieldValue(draft, fieldId), expectedValue: fieldValue(baseline, fieldId), summary: "Updated site content", action: "update" as const }));
      if (changes.length) {
        const response = await fetch("/api/admin/content/apply", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ changes }) });
        const body = await response.json().catch(() => ({})) as { error?: string };
        if (!response.ok) throw new Error(body.error ?? "Text changes could not be saved.");
      }
      if (JSON.stringify(draftMedia) !== JSON.stringify(baselineMedia)) {
        const response = await fetch("/api/admin/content/visual", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ media: draftMedia }) });
        const body = await response.json().catch(() => ({})) as { error?: string };
        if (!response.ok) throw new Error(body.error ?? "Image changes could not be saved.");
      }
      setBaseline(draft); setBaselineMedia(draftMedia); setStatus("Your changes were saved and are live."); router.refresh(); iframeRef.current?.contentWindow?.location.reload();
    } catch (error) { setStatus(error instanceof Error ? error.message : "Your changes could not be saved."); }
    finally { setBusy(false); }
  };

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file || !mediaFields[selected]) return;
    setBusy(true); setStatus("Uploading image…");
    try {
      const start = await fetch("/api/admin/media/uploads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fileName: file.name, contentType: file.type }) });
      const created = await start.json() as { data?: { key: string; url: string; uploadId: string; partSize: number }; error?: string };
      if (!start.ok || !created.data) throw new Error(created.error ?? "Image upload could not start.");
      const parts: Array<{ partNumber: number; etag: string }> = [];
      for (let offset = 0, partNumber = 1; offset < file.size; offset += created.data.partSize, partNumber += 1) {
        const response = await fetch(`/api/admin/media/uploads/${created.data.uploadId}?key=${encodeURIComponent(created.data.key)}&partNumber=${partNumber}`, { method: "PUT", body: file.slice(offset, offset + created.data.partSize) });
        const body = await response.json() as { data?: { etag: string }; error?: string }; if (!response.ok || !body.data) throw new Error(body.error ?? "Image upload failed."); parts.push({ partNumber, etag: body.data.etag });
      }
      const complete = await fetch(`/api/admin/media/uploads/${created.data.uploadId}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: created.data.key, parts }) });
      if (!complete.ok) throw new Error("Image upload could not finish.");
      updateImage({ src: created.data.url, alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "), focalX: 50, focalY: 50 });
      await loadAssets(); setStatus("Image uploaded. Save changes when the crop looks right.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Image upload failed."); }
    finally { setBusy(false); event.target.value = ""; }
  };

  const dirty = Object.keys(EDITABLE_FIELDS).some((id) => fieldValue(draft, id as EditableFieldId) !== fieldValue(baseline, id as EditableFieldId)) || JSON.stringify(draftMedia) !== JSON.stringify(baselineMedia);
  const currentPageFields = useMemo(() => page.fields, [page.fields]);

  return <section className="admin-visual-editor" aria-label="Visual site editor">
    <div className="admin-visual-editor__canvas"><iframe ref={iframeRef} title={`${page.label} visual preview`} src={`${page.path}?editor=1`} /></div>
    <aside className="admin-visual-editor__panel">
      <div><p className="eyebrow">Edit site</p><h2>Content inside the design.</h2><p className="admin-visual-editor__hint">The layout, type system and motion stay protected. Select existing content in the preview to change it.</p></div>
      <label className="admin-visual-editor__page"><span>Page</span><select value={pageLabel} onChange={(event) => selectPage(event.target.value)}>{pages.map((entry) => <option key={entry.label}>{entry.label}</option>)}</select></label>
      <div className="admin-visual-editor__fields"><span className="eyebrow">Page content</span>{currentPageFields.map((id) => <button key={id} type="button" className={selected === id ? "is-selected" : ""} onClick={() => setSelected(id)}>{labels[id]}</button>)}</div>
      {selectedField ? <label className="admin-visual-editor__field"><span>{labels[selectedField]}</span>{isRich ? <><div className="admin-visual-editor__toolbar" role="toolbar" aria-label="Text formatting"><button type="button" onClick={() => command("bold")}><strong>B</strong></button><button type="button" onClick={() => command("italic")}><em>I</em></button><button type="button" onClick={() => command("createLink", window.prompt("Link URL") ?? "")}>Link</button><button type="button" onClick={() => command("unlink")}>Remove link</button><button type="button" onClick={() => command("undo")}>Undo</button></div><div ref={richEditorRef} contentEditable suppressContentEditableWarning onInput={(event) => setValue(event.currentTarget.innerHTML)} role="textbox" aria-multiline="true" /></> : selectedField.includes("body") || selectedField.startsWith("resume.") || selectedField.includes("representation") ? <textarea rows={9} value={selectedValue} onChange={(event) => setValue(event.target.value)} /> : <input value={selectedValue} onChange={(event) => setValue(event.target.value)} />}</label> : null}
      {selectedMedia ? <div className="admin-visual-editor__media"><span>{mediaFields[selected].label}</span><div className="admin-visual-editor__media-preview"><img src={selectedMedia.src} alt="Current selection" style={{ objectPosition: `${selectedMedia.focalX}% ${selectedMedia.focalY}%` }} /></div><div className="admin-visual-editor__media-grid">{assets.map((asset) => <button key={asset.key} type="button" onClick={() => updateImage({ src: asset.url ?? "", alt: asset.title ?? selectedMedia.alt })}><img src={asset.url ?? ""} alt={asset.title ?? "Choose image"} /></button>)}</div><label>Image alt text<input value={selectedMedia.alt} onChange={(event) => updateImage({ alt: event.target.value })} /></label><label>Focal point X<input type="range" min="0" max="100" value={selectedMedia.focalX} onChange={(event) => updateImage({ focalX: Number(event.target.value) })} /></label><label>Focal point Y<input type="range" min="0" max="100" value={selectedMedia.focalY} onChange={(event) => updateImage({ focalY: Number(event.target.value) })} /></label><label>Image treatment<select value={selectedMedia.fit} onChange={(event) => updateImage({ fit: event.target.value as SiteImage["fit"] })}><option value="cover">Cover crop</option><option value="contain">Show full image</option></select></label><label className="admin-visual-editor__upload">Upload new image<input type="file" accept="image/*" onChange={(event) => void upload(event)} disabled={busy} /></label></div> : null}
      <div className="admin-visual-editor__actions"><button type="button" onClick={() => { iframeRef.current?.contentWindow?.postMessage({ type: "editor-mode", enabled: false }, window.location.origin); setStatus("Previewing the current page. Save when you are ready to publish."); }} disabled={busy}>Preview</button><button type="button" onClick={() => void save()} disabled={!dirty || busy}>{busy ? "Saving…" : "Save changes"}</button><button type="button" onClick={() => { setDraft(baseline); setDraftMedia(baselineMedia); setStatus("Unsaved changes discarded."); }} disabled={!dirty || busy}>Discard</button></div>
      <p className="admin-visual-editor__status" role="status">{status}</p>
    </aside>
  </section>;
}
