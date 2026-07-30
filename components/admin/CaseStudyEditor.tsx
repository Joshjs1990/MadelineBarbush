"use client";

import { type FormEvent, useMemo, useState } from "react";
import type { ProjectCredit, ProjectGalleryImage, ProjectVideoEmbed } from "@/types/project";

type EditorDraft = {
  title: string;
  slug: string;
  year: string;
  type: string;
  role: string;
  director: string;
  productionCompany: string;
  intro: string;
  description: string;
  archiveNote: string;
  longDescription: string;
  performanceNotes: string;
  atmosphere: string;
  heroImage: string;
  gallery: ProjectGalleryImage[];
  videoEmbeds: ProjectVideoEmbed[];
  credits: ProjectCredit[];
  pullQuote: string;
  accentColor: string;
  textColor: string;
  relatedProjectSlug: string;
  externalLink: string;
  featured: boolean;
  order: string;
};

const initialDraft: EditorDraft = {
  title: "",
  slug: "",
  year: "2026",
  type: "Television",
  role: "",
  director: "",
  productionCompany: "",
  intro: "",
  description: "",
  archiveNote: "",
  longDescription: "",
  performanceNotes: "",
  atmosphere: "",
  heroImage: "/images/actor-wide.jpg",
  gallery: [
    { src: "/images/actor-wide.jpg", alt: "", orientation: "landscape" },
    { src: "/images/actor-close.jpg", alt: "", orientation: "portrait" },
  ],
  videoEmbeds: [{ title: "", url: "" }],
  credits: [
    { label: "Role", value: "" },
    { label: "Type", value: "Television" },
    { label: "Production", value: "Production TBA" },
  ],
  pullQuote: "",
  accentColor: "#e8ff2a",
  textColor: "#10100c",
  relatedProjectSlug: "after-the-last-train",
  externalLink: "",
  featured: false,
  order: "7",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function CaseStudyEditor() {
  const [draft, setDraft] = useState(initialDraft);
  const [status, setStatus] = useState("Draft ready");

  const previewCredits = useMemo(
    () => draft.credits.filter((credit) => credit.label.trim() && credit.value.trim()),
    [draft.credits],
  );

  const updateDraft = (key: keyof EditorDraft, value: EditorDraft[keyof EditorDraft]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const updateCredit = (index: number, key: keyof ProjectCredit, value: string) => {
    setDraft((current) => ({
      ...current,
      credits: current.credits.map((credit, creditIndex) =>
        creditIndex === index ? { ...credit, [key]: value } : credit,
      ),
    }));
  };

  const updateGalleryImage = (index: number, key: keyof ProjectGalleryImage, value: string) => {
    setDraft((current) => ({
      ...current,
      gallery: current.gallery.map((image, imageIndex) =>
        imageIndex === index ? { ...image, [key]: value } : image,
      ),
    }));
  };

  const updateVideoEmbed = (index: number, key: keyof ProjectVideoEmbed, value: string) => {
    setDraft((current) => ({
      ...current,
      videoEmbeds: current.videoEmbeds.map((embed, embedIndex) =>
        embedIndex === index ? { ...embed, [key]: value } : embed,
      ),
    }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Saving");

    const payload = {
      ...draft,
      longDescription: lines(draft.longDescription),
      performanceNotes: lines(draft.performanceNotes),
      gallery: draft.gallery.filter((image) => image.src.trim()),
      videoEmbeds: draft.videoEmbeds.filter((embed) => embed.url.trim()),
      credits: previewCredits,
      order: Number.parseInt(draft.order, 10) || Date.now(),
      externalLink: draft.externalLink || undefined,
      director: draft.director || undefined,
      productionCompany: draft.productionCompany || undefined,
    };

    const response = await fetch("/api/admin/case-studies", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await response.json()) as { error?: string };

    setStatus(response.ok ? "Saved" : body.error ?? "Unable to save");
  };

  return (
    <form className="admin-editor" onSubmit={submit}>
      <section className="admin-section">
        <div>
          <p className="eyebrow">Case study</p>
          <h2>Basics</h2>
        </div>
        <div className="admin-fields">
          <label>
            <span>Title</span>
            <input
              value={draft.title}
              onChange={(event) => {
                updateDraft("title", event.target.value);
                updateDraft("slug", slugify(event.target.value));
              }}
              required
            />
          </label>
          <label>
            <span>Slug</span>
            <input value={draft.slug} onChange={(event) => updateDraft("slug", slugify(event.target.value))} required />
          </label>
          <label>
            <span>Year</span>
            <input value={draft.year} onChange={(event) => updateDraft("year", event.target.value)} required />
          </label>
          <label>
            <span>Type</span>
            <input value={draft.type} onChange={(event) => updateDraft("type", event.target.value)} required />
          </label>
          <label>
            <span>Role</span>
            <input value={draft.role} onChange={(event) => updateDraft("role", event.target.value)} required />
          </label>
          <label>
            <span>Production</span>
            <input value={draft.productionCompany} onChange={(event) => updateDraft("productionCompany", event.target.value)} />
          </label>
        </div>
      </section>

      <section className="admin-section">
        <div>
          <p className="eyebrow">Editor</p>
          <h2>Text</h2>
        </div>
        <div className="admin-fields">
          <label className="admin-field-wide">
            <span>Intro</span>
            <textarea value={draft.intro} onChange={(event) => updateDraft("intro", event.target.value)} required />
          </label>
          <label className="admin-field-wide">
            <span>Description</span>
            <textarea value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} required />
          </label>
          <label>
            <span>Archive note</span>
            <textarea value={draft.archiveNote} onChange={(event) => updateDraft("archiveNote", event.target.value)} required />
          </label>
          <label>
            <span>Pull quote</span>
            <textarea value={draft.pullQuote} onChange={(event) => updateDraft("pullQuote", event.target.value)} required />
          </label>
          <label className="admin-field-wide">
            <span>Long description</span>
            <textarea value={draft.longDescription} onChange={(event) => updateDraft("longDescription", event.target.value)} required />
          </label>
          <label>
            <span>Performance notes</span>
            <textarea value={draft.performanceNotes} onChange={(event) => updateDraft("performanceNotes", event.target.value)} required />
          </label>
          <label>
            <span>Atmosphere</span>
            <input value={draft.atmosphere} onChange={(event) => updateDraft("atmosphere", event.target.value)} required />
          </label>
        </div>
      </section>

      <section className="admin-section">
        <div>
          <p className="eyebrow">Field type</p>
          <h2>Credits</h2>
        </div>
        <div className="admin-repeaters">
          {draft.credits.map((credit, index) => (
            <div className="admin-repeater-row" key={`${credit.label}-${index}`}>
              <input aria-label="Credit label" value={credit.label} onChange={(event) => updateCredit(index, "label", event.target.value)} />
              <input aria-label="Credit value" value={credit.value} onChange={(event) => updateCredit(index, "value", event.target.value)} />
            </div>
          ))}
          <button type="button" onClick={() => updateDraft("credits", [...draft.credits, { label: "", value: "" }])}>
            Add credit field
          </button>
        </div>
      </section>

      <section className="admin-section">
        <div>
          <p className="eyebrow">Media</p>
          <h2>Images and video</h2>
        </div>
        <div className="admin-repeaters">
          <label>
            <span>Hero image URL</span>
            <input value={draft.heroImage} onChange={(event) => updateDraft("heroImage", event.target.value)} required />
          </label>
          {draft.gallery.map((image, index) => (
            <div className="admin-repeater-row admin-repeater-row--media" key={`${image.src}-${index}`}>
              <input aria-label="Image URL" value={image.src} onChange={(event) => updateGalleryImage(index, "src", event.target.value)} />
              <input aria-label="Image alt text" value={image.alt} onChange={(event) => updateGalleryImage(index, "alt", event.target.value)} />
              <select aria-label="Image orientation" value={image.orientation} onChange={(event) => updateGalleryImage(index, "orientation", event.target.value)}>
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
                <option value="square">Square</option>
              </select>
            </div>
          ))}
          <button type="button" onClick={() => updateDraft("gallery", [...draft.gallery, { src: "", alt: "", orientation: "landscape" }])}>
            Add image
          </button>
          {draft.videoEmbeds.map((embed, index) => (
            <div className="admin-repeater-row" key={`${embed.url}-${index}`}>
              <input aria-label="Video title" value={embed.title} onChange={(event) => updateVideoEmbed(index, "title", event.target.value)} />
              <input aria-label="YouTube URL" value={embed.url} onChange={(event) => updateVideoEmbed(index, "url", event.target.value)} />
            </div>
          ))}
          <button type="button" onClick={() => updateDraft("videoEmbeds", [...draft.videoEmbeds, { title: "", url: "" }])}>
            Add YouTube embed
          </button>
        </div>
      </section>

      <section className="admin-section">
        <div>
          <p className="eyebrow">Publishing</p>
          <h2>Style and status</h2>
        </div>
        <div className="admin-fields">
          <label>
            <span>Accent color</span>
            <input type="color" value={draft.accentColor} onChange={(event) => updateDraft("accentColor", event.target.value)} />
          </label>
          <label>
            <span>Text color</span>
            <input type="color" value={draft.textColor} onChange={(event) => updateDraft("textColor", event.target.value)} />
          </label>
          <label>
            <span>Related project slug</span>
            <input value={draft.relatedProjectSlug} onChange={(event) => updateDraft("relatedProjectSlug", event.target.value)} required />
          </label>
          <label>
            <span>Order</span>
            <input value={draft.order} onChange={(event) => updateDraft("order", event.target.value)} />
          </label>
          <label className="admin-checkbox">
            <input type="checkbox" checked={draft.featured} onChange={(event) => updateDraft("featured", event.target.checked)} />
            <span>Featured</span>
          </label>
        </div>
      </section>

      <aside className="admin-publish">
        <div>
          <span>{status}</span>
          <strong>{draft.title || "Untitled case study"}</strong>
        </div>
        <button type="submit">Save case study</button>
      </aside>
    </form>
  );
}
