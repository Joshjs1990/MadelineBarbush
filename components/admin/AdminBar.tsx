"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { Role } from "@/lib/auth/store";

type AdminBarProps = {
  email: string;
  role: Role;
};

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/case-studies", label: "Case studies" },
  { href: "/admin/case-studies/new", label: "New" },
  { href: "/admin/showreel", label: "Showreel" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/account", label: "Account" },
];

export function AdminBar({ email, role }: AdminBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const links = role === "admin" ? [...LINKS, { href: "/admin/users", label: "Users" }] : LINKS;

  const signOut = async () => {
    setBusy(true);
    await fetch("/api/admin/session", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <div className="admin-bar">
      <nav aria-label="Admin sections">
        <Link className="admin-bar__exit" href="/">
          ← Back to site
        </Link>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={(link.label === "Dashboard" ? pathname === "/admin" : pathname === "/admin/case-studies" || pathname.startsWith("/admin/case-studies/")) ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="admin-bar__account">
        <span>
          {email} · {role}
        </span>
        <button type="button" onClick={signOut} disabled={busy}>
          {busy ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}
