"use client";

import { useState } from "react";
import { DEFAULT_EDITABLE_CONTENT, fieldValue, type EditableContent, type EditableFieldId } from "@/lib/assistant/registry";

const palette = [
  ["theme.acid", "Primary accent", "Highlights, buttons and active states"], ["theme.paper", "Surface", "The sitewide background"], ["theme.ink", "Primary ink", "Main text and dark surfaces"], ["theme.blue", "Focus blue", "Blue interface accents"], ["theme.verm", "Vermilion", "Warm accent colour"], ["theme.pink", "Pink", "Pink accent colour"], ["theme.muted", "Muted text", "Secondary text colour"],
] as const;

export function SiteColours({ content }: { content: EditableContent }) {
  const initial = Object.fromEntries(palette.map(([id]) => [id, fieldValue(content, id as EditableFieldId)]));
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [baseline, setBaseline] = useState(initial);
  const [busy, setBusy] = useState(false); const [status, setStatus] = useState("");
  const dirty = palette.some(([id]) => values[id] !== baseline[id]);
  const save = async (nextValues: Record<string, string>, ids = palette.map(([id]) => id)) => {
    setBusy(true); setStatus("Saving colours…");
    const changes = ids.map((id) => ({ fieldId: id, value: nextValues[id], expectedValue: baseline[id], summary: "Updated site colours", action: "update" }));
    const response = await fetch("/api/admin/assistant/apply", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ changes }) });
    const body = await response.json().catch(() => ({})) as { error?: string; data?: { message?: string } };
    setBusy(false); if (!response.ok) { setStatus(body.error ?? "Colours could not be saved."); return; }
    setValues(nextValues); setBaseline(nextValues); setStatus(body.data?.message ?? "Colours saved."); window.dispatchEvent(new Event("assistant-history-updated"));
  };
  const resetOne = (id: string) => void save({ ...values, [id]: fieldValue(DEFAULT_EDITABLE_CONTENT, id as EditableFieldId) }, [id]);
  const resetAll = () => { if (window.confirm("Reset all site colours to their original palette?")) void save(Object.fromEntries(palette.map(([id]) => [id, fieldValue(DEFAULT_EDITABLE_CONTENT, id as EditableFieldId)]))); };
  return <div className="admin-dashboard-section admin-colour-section"><div className="admin-section-heading"><div><p className="eyebrow">Design system</p><h2>Site Colours</h2><p>These are the actual colours used throughout the public site. Changes are saved to the site settings and recorded in history.</p></div><div className="admin-settings-actions"><button type="button" onClick={() => void save(values)} disabled={!dirty || busy}>{busy ? "Saving…" : "Save colours"}</button><button type="button" className="admin-button--quiet" onClick={resetAll} disabled={busy}>Reset all</button></div></div><div className="admin-colour-list">{palette.map(([id, label, description]) => <div className="admin-colour-row" key={id}><span className="admin-colour-swatch" style={{ backgroundColor: values[id] }} aria-hidden="true" /><div><label htmlFor={`${id}-hex`}>{label}</label><p>{description}</p></div><input aria-label={`${label} colour picker`} type="color" value={/^#[0-9a-f]{6}$/i.test(values[id]) ? values[id] : "#000000"} onChange={(event) => setValues({ ...values, [id]: event.target.value })} /><input id={`${id}-hex`} aria-label={`${label} hex value`} className="admin-colour-hex" value={values[id]} onChange={(event) => setValues({ ...values, [id]: event.target.value })} /><button type="button" className="admin-button--quiet" onClick={() => resetOne(id)} disabled={busy || values[id] === fieldValue(DEFAULT_EDITABLE_CONTENT, id as EditableFieldId)}>Reset</button></div>)}</div>{status ? <p className="admin-form-status" role="status">{status}</p> : null}</div>;
}
