import type { Metadata } from "next";
import Link from "next/link";
import { AdminBar } from "@/components/admin/AdminBar";
import { AdminUnconfigured } from "@/components/admin/AdminUnconfigured";
import { CaseStudyList } from "@/components/admin/CaseStudyList";
import { resolveAdminAccess } from "@/lib/auth/guard";
import { listCaseStudiesForAdmin } from "@/lib/case-studies/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Case Studies", robots: { index: false, follow: false, nocache: true } };

export default async function AdminCaseStudiesPage() {
  const access = await resolveAdminAccess();
  if (access.state === "unconfigured") return <AdminUnconfigured />;
  const entries = await listCaseStudiesForAdmin();
  return <main className="admin-page"><AdminBar email={access.user.email} role={access.user.role} /><section className="admin-hero" aria-labelledby="case-studies-title"><p className="eyebrow">Portfolio</p><h1 id="case-studies-title">Case studies.</h1><p>Edit, hide or show portfolio entries, or <Link href="/admin/case-studies/new">add a new one</Link>.</p></section><CaseStudyList entries={entries} /></main>;
}
