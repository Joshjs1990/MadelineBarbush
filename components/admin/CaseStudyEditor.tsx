"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import type { AdminCaseStudy } from "@/lib/case-studies/store";
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
  hidden: boolean;
  order: string;
};

type CaseStudyEditorProps = {
  /** Omitted when creating; supplied when editing an existing case study. */
  entry?: AdminCaseStudy;
  /** Slugs offered as the "related project" link. */
  relatedOptions: { slug: string; title: string }[];
  /** Order value suggested for a new entry, so it lands at the end of the list. */
  nextOrder?: number;
};

function blankDraft(nextOrder: number, relatedSlug: string): EditorDraft {
  return {
    title: "",
    slug: "",
    year: String(new Date().getFullYear()),
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
    heroImage: "/images/work/glasshouse-static.webp",
    gallery: [{ src: "/images/work/glasshouse-static.webp", alt: "", orientation: "landscape" }],
    videoEmbeds: [{ title: "", url: "" }],
    credits: [
      { label: "Role", value: "" },
      { label: "Type", value: "Television" },
      { label: "Production", value: "Production TBA" },
    ],
    pullQuote: "",
    accentColor: "#e8ff2a",
    textColor: "#10100c",
    relatedProjectSlug: relatedSlug,
    externalLink: "",
    featured: false,
    hidden: false,
    order: String(nextOrder),
  };
}

function draftFromEntry(entry: AdminCaseStudy): EditorDraft {
  const { project } = entry;

  return {
    title: project.title,
    slug: project.slug,
    year: project.year,
    type: project.type,
    role: project.role,
    director: project.director ?? "",
    productionCompany: project.productionCompany ?? "",
    intro: project.intro,
    description: project.description,
    archiveNote: project.archiveNote,
    longDescription: project.longDescription.join("\n"),
    performanceNotes: project.performanceNotes.join("\n"),
    atmosphere: project.atmosphere,
    heroImage: project.heroImage,
    gallery: project.gallery.length
      ? project.gallery
      : [{ src: "", alt: "", orientation: "landscape" }],
    videoEmbeds: project.videoEmbeds?.length ? project.videoEmbeds : [{ title: "", url: "" }],
    credits: project.credits.length ? project.credits : [{ label: "", value: "" }],
    pullQuote: project.pullQuote,
    accentColor: project.accentColor,
    textColor: project.textColor,
    relatedProjectSlug: project.relatedProjectSlug,
    externalLink: project.externalLink ?? "",
    featured: project.featured,
    hidden: entry.hidden,
    order: String(project.order),
  };
}

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

export function CaseStudyEditor({ entry, relatedOptions, nextOrder = 1 }: CaseStudyEditorProps) {
  const router = useRouter();
  const [draft, setDraft] = useState(() =>
    entry ? draftFromEntry(entry) : blankDraft(nextOrder, relatedOptions[0]?.slug ?? ""),
  );
  const [status, setStatus] = useState(entry ? "Editing" : "Draft ready");
  const [busy, setBusy] = useState(false);

  // The slug the entry is stored under, which is what a rename has to replace.
  const originalSlug = entry?.project.slug;

  const previewCredits = useMemo(
    () => draft.credits.filter((credit) => credit.label.trim() && credit.value.trim()),
    [draft.credits],
  );

  // Keep the stored value selectable even when it is not in the offered list,
  // so opening the editor cannot silently repoint an existing link.
  const relatedChoices = useMemo(() => {
    const current = draft.relatedProjectSlug;
    if (!current || relatedOptions.some((option) => option.slug === current)) {
      return relatedOptions;
    }
    return [{ slug: current, title: current }, ...relatedOptions];
  }, [draft.relatedProjectSlug, relatedOptions]);

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

  const removeCredit = (index: number) => {
    setDraft((current) => ({
      ...current,
      credits: current.credits.filter((_, creditIndex) => creditIndex !== index),
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

  const removeGalleryImage = (index: number) => {
    setDraft((current) => ({
      ...current,
      gallery: current.gallery.filter((_, imageIndex) => imageIndex !== index),
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

  const removeVideoEmbed = (index: number) => {
    setDraft((current) => ({
      ...current,
      videoEmbeds: current.videoEmbeds.filter((_, embedIndex) => embedIndex !== index),
    }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
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

    const response = await fetch(
      originalSlug
        ? `/api/admin/case-studies/${encodeURIComponent(originalSlug)}`
        : "/api/admin/case-studies",
      {
        method: originalSlug ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setBusy(false);

    if (!response.ok) {
      setStatus(body.error ?? "Unable to save");
      return;
    }

    setStatus("Saved");
    router.push("/admin");
    router.refresh();
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
                const title = event.target.value;
                setDraft((current) => ({
                  ...current,
                  title,
                  // Only track the title while the slug is still unpublished —
                  // changing a live slug breaks the URL people already have.
                  slug: originalSlug ? current.slug : slugify(title),
                }));
              }}
              required
            />
          </label>
          <label>
            <span>Slug</span>
            <input
              value={draft.slug}
              onChange={(event) => updateDraft("slug", slugify(event.target.value))}
              required
            />
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
            <span>Director</span>
            <input value={draft.director} onChange={(event) => updateDraft("director", event.target.value)} />
          </label>
          <label>
            <span>Production</span>
            <input value={draft.productionCompany} onChange={(event) => updateDraft("productionCompany", event.target.value)} />
          </label>
          <label>
            <span>External link</span>
            <input
              value={draft.externalLink}
              onChange={(event) => updateDraft("externalLink", event.target.value)}
              placeholder="https://"
            />
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
            <span>Long description — one paragraph per line</span>
            <textarea value={draft.longDescription} onChange={(event) => updateDraft("longDescription", event.target.value)} required />
          </label>
          <label>
            <span>Performance notes — one per line</span>
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
            <div className="admin-repeater-row" key={`credit-${index}`}>
              <input aria-label="Credit label" value={credit.label} onChange={(event) => updateCredit(index, "label", event.target.value)} />
              <input aria-label="Credit value" value={credit.value} onChange={(event) => updateCredit(index, "value", event.target.value)} />
              <button type="button" onClick={() => removeCredit(index)}>
                Remove
              </button>
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
            <div className="admin-repeater-item" key={`image-${index}`}>
              <div className="admin-repeater-heading">
                <span>Image {index + 1}</span>
                <button type="button" onClick={() => removeGalleryImage(index)}>
                  Remove image
                </button>
              </div>
              <div className="admin-repeater-row admin-repeater-row--media">
                <label>
                  <span>Image URL</span>
                  <input
                    value={image.src}
                    onChange={(event) => updateGalleryImage(index, "src", event.target.value)}
                    placeholder="/images/work/example.webp"
                  />
                </label>
                <label>
                  <span>Alt text</span>
                  <input
                    value={image.alt}
                    onChange={(event) => updateGalleryImage(index, "alt", event.target.value)}
                    placeholder="Describe what appears in the image"
                  />
                </label>
                <label>
                  <span>Orientation</span>
                  <select value={image.orientation} onChange={(event) => updateGalleryImage(index, "orientation", event.target.value)}>
                    <option value="landscape">Landscape</option>
                    <option value="portrait">Portrait</option>
                    <option value="square">Square</option>
                  </select>
                </label>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => updateDraft("gallery", [...draft.gallery, { src: "", alt: "", orientation: "landscape" }])}>
            Add image
          </button>
          {draft.videoEmbeds.map((embed, index) => (
            <div className="admin-repeater-item" key={`video-${index}`}>
              <div className="admin-repeater-heading">
                <span>Video {index + 1}</span>
                <button type="button" onClick={() => removeVideoEmbed(index)}>
                  Remove video
                </button>
              </div>
              <div className="admin-repeater-row">
                <label>
                  <span>Video title</span>
                  <input
                    value={embed.title}
                    onChange={(event) => updateVideoEmbed(index, "title", event.target.value)}
                    placeholder="Trailer, reel or scene title"
                  />
                </label>
                <label>
                  <span>YouTube URL</span>
                  <input
                    value={embed.url}
                    onChange={(event) => updateVideoEmbed(index, "url", event.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </label>
              </div>
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
            <span>Related project</span>
            <select
              value={draft.relatedProjectSlug}
              onChange={(event) => updateDraft("relatedProjectSlug", event.target.value)}
              required
            >
              {relatedChoices.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Order</span>
            <input value={draft.order} onChange={(event) => updateDraft("order", event.target.value)} />
          </label>
          <label className="admin-checkbox">
            <input type="checkbox" checked={draft.featured} onChange={(event) => updateDraft("featured", event.target.checked)} />
            <span>Featured</span>
          </label>
          <label className="admin-checkbox">
            <input type="checkbox" checked={draft.hidden} onChange={(event) => updateDraft("hidden", event.target.checked)} />
            <span>Hidden from the site</span>
          </label>
        </div>
      </section>

      <aside className="admin-publish">
        <div>
          <span>{status}</span>
          <strong>{draft.title || "Untitled case study"}</strong>
        </div>
        <div className="admin-publish__actions">
          <Link href="/admin">Cancel</Link>
          <button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save case study"}
          </button>
        </div>
      </aside>
    </form>
  );
}
