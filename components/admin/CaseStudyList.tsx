"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminCaseStudy } from "@/lib/case-studies/store";

type CaseStudyListProps = {
  entries: AdminCaseStudy[];
};

export function CaseStudyList({ entries }: CaseStudyListProps) {
  const router = useRouter();
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (slug: string, request: () => Promise<Response>) => {
    setPendingSlug(slug);
    setError(null);

    const response = await request();
    const body = (await response.json().catch(() => ({}))) as { error?: string };

    setPendingSlug(null);

    if (!response.ok) {
      setError(body.error ?? "That change could not be saved.");
      return;
    }

    router.refresh();
  };

  const toggleHidden = (entry: AdminCaseStudy) =>
    run(entry.project.slug, () =>
      fetch(`/api/admin/case-studies/${encodeURIComponent(entry.project.slug)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hidden: !entry.hidden }),
      }),
    );

  const remove = (entry: AdminCaseStudy) => {
    const message = entry.seeded
      ? `Reset “${entry.project.title}” to the built-in version? Your edits to it will be lost.`
      : `Delete “${entry.project.title}” permanently?`;

    if (!window.confirm(message)) return;

    return run(entry.project.slug, () =>
      fetch(`/api/admin/case-studies/${encodeURIComponent(entry.project.slug)}`, {
        method: "DELETE",
      }),
    );
  };

  if (!entries.length) {
    return (
      <p className="admin-empty">
        No case studies yet. <Link href="/admin/case-studies/new">Add the first one.</Link>
      </p>
    );
  }

  return (
    <div className="admin-list">
      {error ? (
        <p className="admin-auth-error" role="alert">
          {error}
        </p>
      ) : null}

      <ul>
        {entries.map((entry) => {
          const busy = pendingSlug === entry.project.slug;

          return (
            <li key={entry.project.slug} className="admin-list__row" data-hidden={entry.hidden}>
              <div className="admin-list__main">
                <p className="admin-list__meta">
                  {entry.project.year} · {entry.project.type}
                  {entry.project.featured ? " · Featured" : ""}
                </p>
                <h2>{entry.project.title}</h2>
                <p className="admin-list__slug">/work/{entry.project.slug}</p>
              </div>

              <div className="admin-list__tags">
                <span data-tone={entry.hidden ? "hidden" : "live"}>
                  {entry.hidden ? "Hidden" : "Live"}
                </span>
                <span data-tone="source">{entry.stored ? "Edited" : "Built-in"}</span>
              </div>

              <div className="admin-list__actions">
                <Link href={`/admin/case-studies/${encodeURIComponent(entry.project.slug)}`}>
                  Edit
                </Link>
                <button type="button" onClick={() => toggleHidden(entry)} disabled={busy}>
                  {entry.hidden ? "Show" : "Hide"}
                </button>
                {entry.stored ? (
                  <button type="button" onClick={() => remove(entry)} disabled={busy}>
                    {entry.seeded ? "Reset" : "Delete"}
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
