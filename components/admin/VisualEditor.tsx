"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { EDITABLE_FIELDS, fieldValue, setFieldValue, type EditableContent, type EditableFieldId } from "@/lib/assistant/registry";
import { richTextHtml } from "@/lib/content/rich-text";
import type { SiteImage, VisualMedia } from "@/lib/site-settings/media";
import { TEXT_SIZE_OPTIONS, textSizingCssValues, type TextSize, type TextSizing } from "@/lib/site-settings/typography-shared";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

type SpecialFieldId = "recentHighlights.content";
type EditorFieldId = EditableFieldId | SpecialFieldId;
type Page = { label: string; path: string; fields: EditorFieldId[]; media?: string[] };
type Asset = { key: string; url: string | null; title?: string; contentType: string };

const pages: Page[] = [
  { label: "Home", path: "/", fields: ["home.heroHeading", "home.heroRole", "home.heroCopy"], media: ["home.heroImage"] },
  { label: "Bio", path: "/bio", fields: ["about.heading", "about.intro", "about.body"], media: ["bio.image"] },
  { label: "Resume", path: "/resume", fields: ["pages.resumeHeading", "resume.intro", "resume.theaterHeading", "resume.theater", "resume.stagedReadingsHeading", "resume.stagedReadings", "resume.filmHeading", "resume.film", "resume.trainingHeading", "resume.training", "resume.skillsHeading", "resume.skills"], media: ["resume.primaryImage", "resume.secondaryImage"] },
  { label: "Recent Highlights", path: "/recent-highlights", fields: ["pages.recentHighlightsHeading", "recentHighlights.content"], media: ["recentHighlights.primaryImage", "recentHighlights.secondaryImage"] },
  { label: "Media", path: "/photos", fields: ["pages.photosHeading"] },
  { label: "Contact", path: "/contact", fields: ["pages.contactHeading", "contact.representation", "contact.note", "contact.formHeading"], media: ["contact.image"] },
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

const labels: Record<string, string> = { ...Object.fromEntries(Object.entries(EDITABLE_FIELDS).map(([id, field]) => [id, field.label])), "recentHighlights.content": "Recent Highlights copy" };
const editorFieldIds = new Set<string>([...Object.keys(EDITABLE_FIELDS), "recentHighlights.content"]);
const isEditorField = (value: string): value is EditorFieldId => editorFieldIds.has(value);

function contentValue(content: EditableContent, id: EditableFieldId) { return fieldValue(content, id); }

export function VisualEditor({ content, media, textSizing }: { content: EditableContent; media: VisualMedia; textSizing: TextSizing }) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [pageLabel, setPageLabel] = useState("Home");
  const [selected, setSelected] = useState<string>("home.heroHeading");
  const [draft, setDraft] = useState(content);
  const [baseline, setBaseline] = useState(content);
  const [draftMedia, setDraftMedia] = useState(media);
  const [baselineMedia, setBaselineMedia] = useState(media);
  const [draftTextSizing, setDraftTextSizing] = useState(textSizing);
  const [baselineTextSizing, setBaselineTextSizing] = useState(textSizing);
  const [recentHighlights, setRecentHighlights] = useState("");
  const [baselineRecentHighlights, setBaselineRecentHighlights] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [status, setStatus] = useState("Click any outlined text or image in the page preview to edit it.");
  const [busy, setBusy] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const page = pages.find((entry) => entry.label === pageLabel) ?? pages[0];
  const selectedIsSpecial = selected === "recentHighlights.content";
  const selectedField = !mediaFields[selected] && !selectedIsSpecial ? selected as EditableFieldId : null;
  const selectedMedia = mediaFields[selected] ? draftMedia[mediaFields[selected].slot] : null;
  const selectedValue = selectedField ? contentValue(draft, selectedField) : selectedIsSpecial ? recentHighlights : "";
  const isRich = selectedIsSpecial || Boolean(selectedField && EDITABLE_FIELDS[selectedField]?.type === "richText");
  const selectedRichText = Boolean(selectedField && EDITABLE_FIELDS[selectedField]?.type === "richText");
  const selectedTextSize = selectedRichText && selectedField ? draftTextSizing[selectedField] ?? "standard" : "standard";
  const selectedMediaSlot = mediaFields[selected]?.slot;

  const loadAssets = async () => {
    try {
      const response = await fetch("/api/admin/media", { cache: "no-store" });
      const body = await response.json().catch(() => ({})) as { data?: Asset[]; error?: string };
      if (!response.ok) throw new Error(body.error ?? `Media library could not be loaded (${response.status}).`);
      const imageAssets = (body.data ?? []).filter((asset) => asset.url && (asset.contentType?.startsWith("image/") || /\.(avif|gif|jpe?g|png|webp)(?:[?#].*)?$/i.test(asset.url)));
      setAssets(imageAssets);
      if (!imageAssets.length) setStatus("No image files were returned by the media library. Check the Media page or upload a photo there first.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Media library could not be loaded.");
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAssets();
      void fetch("/api/admin/recent-highlights", { cache: "no-store" }).then(async (response) => {
        const body = await response.json().catch(() => ({})) as { data?: { html?: string } };
        if (response.ok) {
          const html = body.data?.html ?? "";
          setRecentHighlights(html);
          setBaselineRecentHighlights(html);
        }
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type === "editor-select" && (event.data.field in mediaFields || isEditorField(event.data.field))) { setMediaPickerOpen(false); setSelected(event.data.field); }
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  useEffect(() => {
    if (!mediaPickerOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMediaPickerOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [mediaPickerOpen]);
  useEffect(() => {
    const values = {
      ...Object.fromEntries(Object.values(EDITABLE_FIELDS).map((field) => [field.id, field.type === "richText" ? richTextHtml(fieldValue(draft, field.id)) : fieldValue(draft, field.id)])),
      "recentHighlights.content": recentHighlights,
    };
    const mediaValues = Object.fromEntries(Object.entries(draftMedia).map(([key, image]) => [key === "homeHero" ? "home.heroImage" : key === "resumePrimary" ? "resume.primaryImage" : key === "resumeSecondary" ? "resume.secondaryImage" : key === "recentPrimary" ? "recentHighlights.primaryImage" : key === "recentSecondary" ? "recentHighlights.secondaryImage" : `${key}.image`, image]));
    iframeRef.current?.contentWindow?.postMessage({ type: "editor-preview-all", values, media: mediaValues, textSizing: textSizingCssValues(draftTextSizing) }, window.location.origin);
  }, [draft, draftMedia, draftTextSizing, recentHighlights]);

  const selectPage = (next: string) => { setPageLabel(next); const nextPage = pages.find((entry) => entry.label === next); setMediaPickerOpen(false); setSelected(nextPage?.fields[0] ?? "home.heroHeading"); };
  const setValue = (value: string) => {
    if (selected === "recentHighlights.content") setRecentHighlights(value);
    else if (selectedField) setDraft((current) => setFieldValue(current, selectedField, value));
  };
  const updateImage = (patch: Partial<SiteImage>) => { if (!mediaFields[selected]) return; const slot = mediaFields[selected].slot; setDraftMedia((current) => ({ ...current, [slot]: { ...current[slot], ...patch } })); };
  const updateTextSize = (value: TextSize) => { if (!selectedRichText || !selectedField) return; setDraftTextSizing((current) => ({ ...current, [selectedField]: value })); };

  const save = async () => {
    setBusy(true); setStatus("Saving changes…");
    try {
      const changes = (Object.keys(EDITABLE_FIELDS) as EditableFieldId[]).filter((id) => fieldValue(draft, id) !== fieldValue(baseline, id)).map((fieldId) => ({ fieldId, value: fieldValue(draft, fieldId), expectedValue: fieldValue(baseline, fieldId), summary: "Updated site content", action: "update" as const }));
      if (changes.length) {
        const response = await fetch("/api/admin/content/apply", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ changes }) });
        const body = await response.json().catch(() => ({})) as { error?: string };
        if (!response.ok) throw new Error(body.error ?? "Text changes could not be saved.");
      }
      const mediaDirty = JSON.stringify(draftMedia) !== JSON.stringify(baselineMedia);
      const textSizingDirty = JSON.stringify(draftTextSizing) !== JSON.stringify(baselineTextSizing);
      if (mediaDirty || textSizingDirty) {
        const response = await fetch("/api/admin/content/visual", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...(mediaDirty ? { media: draftMedia } : {}), ...(textSizingDirty ? { textSizing: draftTextSizing } : {}) }) });
        const body = await response.json().catch(() => ({})) as { error?: string };
        if (!response.ok) throw new Error(body.error ?? "Visual changes could not be saved.");
      }
      if (recentHighlights !== baselineRecentHighlights) {
        const response = await fetch("/api/admin/recent-highlights", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ html: recentHighlights }) });
        const body = await response.json().catch(() => ({})) as { error?: string };
        if (!response.ok) throw new Error(body.error ?? "Recent Highlights could not be saved.");
      }
      setBaseline(draft); setBaselineMedia(draftMedia); setBaselineTextSizing(draftTextSizing); setBaselineRecentHighlights(recentHighlights); setStatus("Your changes were saved and are live."); router.refresh(); iframeRef.current?.contentWindow?.location.reload();
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

  const dirty = Object.keys(EDITABLE_FIELDS).some((id) => fieldValue(draft, id as EditableFieldId) !== fieldValue(baseline, id as EditableFieldId)) || JSON.stringify(draftMedia) !== JSON.stringify(baselineMedia) || JSON.stringify(draftTextSizing) !== JSON.stringify(baselineTextSizing) || recentHighlights !== baselineRecentHighlights;
  const currentPageFields = useMemo(() => page.fields, [page.fields]);
  const currentPageMedia = useMemo(() => page.media ?? [], [page.media]);

  return <section className="admin-visual-editor" aria-label="Visual site editor">
    <div className="admin-visual-editor__canvas"><iframe ref={iframeRef} title={`${page.label} visual preview`} src={`${page.path}?editor=1`} /></div>
    <aside className="admin-visual-editor__panel">
      <label className="admin-visual-editor__page"><span>Page</span><select value={pageLabel} onChange={(event) => selectPage(event.target.value)}>{pages.map((entry) => <option key={entry.label}>{entry.label}</option>)}</select></label>
      <div className="admin-visual-editor__fields" role="tablist" aria-label={`${page.label} content fields`}>
        <span className="eyebrow">Page content</span>
        <div className="admin-visual-editor__tabs">
          {currentPageFields.map((id) => <button key={id} type="button" role="tab" aria-selected={selected === id} className={selected === id ? "is-selected" : ""} onClick={() => { setMediaPickerOpen(false); setSelected(id); }}>{labels[id]}</button>)}
        </div>
      </div>
      {currentPageMedia.length ? <div className="admin-visual-editor__fields" role="tablist" aria-label={`${page.label} image fields`}>
        <span className="eyebrow">Page images</span>
        <div className="admin-visual-editor__tabs admin-visual-editor__tabs--images">
          {currentPageMedia.map((id) => <button key={id} type="button" role="tab" aria-selected={selected === id} className={selected === id ? "is-selected" : ""} onClick={() => { setMediaPickerOpen(false); setSelected(id); }}>{mediaFields[id].label}</button>)}
        </div>
      </div> : null}
      {(selectedField || selected === "recentHighlights.content") ? <div className="admin-visual-editor__field"><span>{labels[selected]}</span>{isRich ? <RichTextEditor value={selectedValue} onChange={setValue} /> : selectedField?.includes("body") || selectedField?.includes("representation") ? <textarea rows={9} value={selectedValue} onChange={(event) => setValue(event.target.value)} /> : <input value={selectedValue} onChange={(event) => setValue(event.target.value)} />}</div> : null}
      {selectedRichText && selectedField ? <label className="admin-visual-editor__font-size"><span>Font size</span><select value={selectedTextSize} onChange={(event) => updateTextSize(event.target.value as TextSize)}>{TEXT_SIZE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><small>Applies to this text block on the public page.</small></label> : null}
      {selectedMedia ? <div className="admin-visual-editor__media">
        <div className="admin-visual-editor__media-heading">
          <div><span className="admin-visual-editor__label">Page image</span><strong>{mediaFields[selected].label}</strong></div>
          <span className="admin-visual-editor__media-status">{selectedMedia.fit === "cover" ? "Fills section" : "Shows full image"}</span>
        </div>
        <div className={`admin-visual-editor__media-preview ${selectedMedia.fit === "contain" ? "is-contained" : "is-filled"}`}>
          <img src={selectedMedia.src} alt="Current selection" style={{ objectPosition: `${selectedMedia.focalX}% ${selectedMedia.focalY}%`, objectFit: selectedMedia.fit }} />
        </div>
        <button className="admin-visual-editor__media-open" type="button" aria-haspopup="dialog" aria-expanded={mediaPickerOpen} onClick={() => setMediaPickerOpen(true)}><span>Choose from media library</span><small>{assets.length ? `${assets.length} image${assets.length === 1 ? "" : "s"} available` : "No images yet"}</small></button>
        {mediaPickerOpen ? <div className="admin-visual-editor__media-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setMediaPickerOpen(false); }}><div className="admin-visual-editor__media-dialog" role="dialog" aria-modal="true" aria-labelledby="media-picker-title"><div className="admin-visual-editor__media-dialog-header"><div><p className="eyebrow">Media library</p><h3 id="media-picker-title">Choose an image</h3></div><button type="button" className="admin-visual-editor__media-dialog-close" onClick={() => setMediaPickerOpen(false)} autoFocus>Close</button></div>{assets.length ? <div className="admin-visual-editor__media-dialog-grid">{assets.map((asset) => <button key={asset.key} type="button" className={asset.url === selectedMedia.src ? "is-selected" : ""} aria-label={`Use ${asset.title ?? "this image"}`} onClick={() => { updateImage({ src: asset.url ?? "", alt: asset.title ?? selectedMedia.alt }); setMediaPickerOpen(false); }}><img src={asset.url ?? ""} alt={asset.title ?? "Choose image"} /></button>)}</div> : <p className="admin-visual-editor__empty">No image files in the media library yet.</p>}</div></div> : null}
        <div className="admin-visual-editor__media-controls">
          <label className="admin-visual-editor__control"><span>Alt text</span><small>Describe the image for screen readers.</small><input id={`image-alt-${selectedMediaSlot}`} value={selectedMedia.alt} onChange={(event) => updateImage({ alt: event.target.value })} /></label>
          <label className="admin-visual-editor__control"><span>Focal point X <output>{selectedMedia.focalX}%</output></span><small>Move the subject left or right when the image fills its section.</small><input id={`image-focal-x-${selectedMediaSlot}`} type="range" min="0" max="100" value={selectedMedia.focalX} onChange={(event) => updateImage({ focalX: Number(event.target.value) })} /></label>
          <label className="admin-visual-editor__control"><span>Focal point Y <output>{selectedMedia.focalY}%</output></span><small>Move the subject up or down when the image fills its section.</small><input id={`image-focal-y-${selectedMediaSlot}`} type="range" min="0" max="100" value={selectedMedia.focalY} onChange={(event) => updateImage({ focalY: Number(event.target.value) })} /></label>
          <label className="admin-visual-editor__control"><span>Image treatment</span><small>Choose whether the image fills the frame or stays uncropped.</small><select value={selectedMedia.fit} onChange={(event) => updateImage({ fit: event.target.value as SiteImage["fit"] })}><option value="cover">Fill section</option><option value="contain">Show full image</option></select></label>
          <label className="admin-visual-editor__upload"><span>Replace image</span><small>Upload a new image for this section.</small><input type="file" accept="image/*" onChange={(event) => void upload(event)} disabled={busy} /></label>
        </div>
      </div> : null}
      <div className="admin-visual-editor__actions"><button type="button" onClick={() => { iframeRef.current?.contentWindow?.postMessage({ type: "editor-mode", enabled: false }, window.location.origin); setStatus("Previewing the current page. Save when you are ready to publish."); }} disabled={busy}>Preview</button><button type="button" onClick={() => void save()} disabled={!dirty || busy}>{busy ? "Saving…" : "Save changes"}</button><button type="button" onClick={() => { setDraft(baseline); setDraftMedia(baselineMedia); setDraftTextSizing(baselineTextSizing); setRecentHighlights(baselineRecentHighlights); setStatus("Unsaved changes discarded."); }} disabled={!dirty || busy}>Discard</button></div>
      <p className="admin-visual-editor__status" role="status">{status}</p>
    </aside>
  </section>;
}
