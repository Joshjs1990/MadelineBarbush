"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

type SiteNavProps = {
  onInfo?: () => void;
};

export function SiteNav({ onInfo }: SiteNavProps) {
  const [open, setOpen] = useState(false);
  const mobileMenuId = "mobile-menu";

  const navItems = (
    <>
      <Link href="/#work" onClick={() => setOpen(false)}>
        Work
      </Link>
      <button type="button" onClick={() => { setOpen(false); onInfo?.(); }}>
        INFO
      </button>
      <a href="mailto:hello@example.com" onClick={() => setOpen(false)}>
        Contact
      </a>
      <Link href="/#reel" onClick={() => setOpen(false)}>
        Reel
      </Link>
    </>
  );

  return (
    <nav className={`fixed left-0 right-0 top-0 z-50 flex items-start justify-between px-4 py-4 text-xs font-black uppercase tracking-[0.18em] md:px-8 ${open ? "nav-open bg-ink text-paper mix-blend-normal" : "text-white mix-blend-difference"}`}>
      <Link href="/" className="nav-mark" aria-label="Return to project index">
        Madeleline Barbush
      </Link>
      <div className="hidden gap-5 md:flex">{navItems}</div>
      <button
        type="button"
        className="nav-menu md:hidden"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls={mobileMenuId}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "CLOSE" : "MENU"}
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            id={mobileMenuId}
            className="mobile-menu md:hidden"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            {navItems}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
}
