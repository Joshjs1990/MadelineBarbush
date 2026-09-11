"use client";

import { useState } from "react";
import { APPROVED_HEADING_FONTS, fieldValue, type EditableContent, type EditableFieldId } from "@/lib/assistant/registry";
import { GLOBAL_TYPOGRAPHY_FIELDS, TEXT_SIZE_OPTIONS, type GlobalTypography } from "@/lib/site-settings/typography-shared";

const groups = { Contact: ["contact.email", "contact.phone"], "Homepage details": ["home.heroRole", "home.location", "home.languages", "home.workingAcross"], Typography: ["theme.headingFont"], SEO: ["seo.description"] } as const;
const labels: Record<string, string> = { "contact.email": "Email", "contact.phone": "Phone", "home.heroRole": "Role", "home.location": "Location", "home.languages": "Languages", "home.workingAcross": "Working across", "theme.headingFont": "Heading font", "seo.description": "Meta description" };

export function SiteSettings({ content, globalTypography }: { content: EditableContent; globalTypography: GlobalTypography }) {
  const ids = Object.values(groups).flat() as readonly string[];
  const initial = Object.fromEntries(ids.map((id) => [id, fieldValue(content, id as EditableFieldId)]));
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [baseline, setBaseline] = useState(initial);
  const [typeValues, setTypeValues] = useState<GlobalTypography>(globalTypography);
  const [typeBaseline, setTypeBaseline] = useState(globalTypography);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const settingsDirty = ids.some((id) => values[id] !== baseline[id]);
  const typographyDirty = JSON.stringify(typeValues) !== JSON.stringify(typeBaseline);

  const save = async () => {
    if (!settingsDirty && !typographyDirty) {
      setStatus("No unsaved settings.");
      return;
    }
    setBusy(true);
    setStatus("Saving settings…");
    try {
      if (settingsDirty) {
        const changes = ids.filter((id) => values[id] !== baseline[id]).map((fieldId) => ({ fieldId, value: values[fieldId], expectedValue: baseline[fieldId], summary: "Updated site settings", action: "update" }));
        const response = await fetch("/api/admin/content/apply", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ changes }) });
        const body = await response.json().catch(() => ({})) as { error?: string };
        if (!response.ok) throw new Error(body.error ?? "Settings could not be saved.");
      }
      if (typographyDirty) {
        const response = await fetch("/api/admin/content/visual", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ globalTypography: typeValues }) });
        const body = await response.json().catch(() => ({})) as { error?: string };
        if (!response.ok) throw new Error(body.error ?? "Typography could not be saved.");
      }
      setBaseline(values);
      setTypeBaseline(typeValues);
      setStatus("Settings saved.");
      window.dispatchEvent(new Event("assistant-history-updated"));
      window.location.reload();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Settings could not be saved.");
    } finally {
      setBusy(false);
    }
  };

  const set = (id: string, value: string) => setValues({ ...values, [id]: value });
  const setType = (field: keyof GlobalTypography, value: GlobalTypography[keyof GlobalTypography]) => setTypeValues({ ...typeValues, [field]: value });

  return <div className="admin-dashboard-section admin-settings-section">
    <div className="admin-section-heading"><div><p className="eyebrow">Manual controls</p><h2>Site Settings</h2><p>Manage the practical details used by the public pages. These controls do not use the AI assistant.</p></div><button type="button" onClick={() => void save()} disabled={busy || (!settingsDirty && !typographyDirty)}>{busy ? "Saving…" : "Save settings"}</button></div>
    <div className="admin-settings-grid">
      {Object.entries(groups).map(([group, groupIds]) => <section className="admin-settings-group" key={group}>
        <p className="eyebrow">{group}</p>
        {groupIds.map((id) => <label key={id}>{labels[id]}{id === "seo.description" ? <textarea value={values[id]} onChange={(event) => set(id, event.target.value)} maxLength={160} rows={4} /> : id === "theme.headingFont" ? <select value={values[id]} onChange={(event) => set(id, event.target.value)}>{APPROVED_HEADING_FONTS.map((font) => <option key={font}>{font}</option>)}</select> : <input value={values[id]} onChange={(event) => set(id, event.target.value)} />}</label>)}
        {group === "Typography" ? <div className="admin-typography-controls">
          <p className="admin-settings-group__note">Set the relative scale for each type role across the public site.</p>
          {GLOBAL_TYPOGRAPHY_FIELDS.map(([field, label, description]) => <label key={field}><span>{label}</span><select value={typeValues[field]} onChange={(event) => setType(field, event.target.value as GlobalTypography[typeof field])}>{TEXT_SIZE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><small>{description}</small></label>)}
        </div> : null}
      </section>)}
    </div>
    {status ? <p className="admin-form-status" role="status">{status}</p> : null}
  </div>;
}
