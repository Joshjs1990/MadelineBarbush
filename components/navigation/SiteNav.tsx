"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import type { EditableContent } from "@/lib/assistant/registry";

export function SiteNav({ content }: { content: EditableContent }) {
  const [open, setOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const mobileMenuId = "mobile-menu";

  const navItems = (
    <>
      <Link href="/bio" onClick={() => setOpen(false)}>
        Bio
      </Link>
      <Link href="/recent-highlights" onClick={() => setOpen(false)}>
        Recent Highlights
      </Link>
      <div className="site-nav-media" onMouseEnter={() => setMediaOpen(true)} onMouseLeave={() => setMediaOpen(false)}>
        <button type="button" aria-expanded={mediaOpen} onClick={() => setMediaOpen((value) => !value)}>Media</button>
        {mediaOpen ? (
        <div className="site-nav-media__menu">
          <Link href="/video" onClick={() => setOpen(false)}>{content.nav.videoLabel}</Link>
          <Link href="/performance-stills" onClick={() => setOpen(false)}>Performance Stills</Link>
          <Link href="/photos" onClick={() => setOpen(false)}>Photos</Link>
        </div>
        ) : null}
      </div>
      <Link href="/resume" onClick={() => setOpen(false)}>
        Resume
      </Link>
      <Link href="/contact" onClick={() => setOpen(false)}>
        Contact
      </Link>
    </>
  );

  return (
    <nav className={`fixed left-0 right-0 top-0 z-50 flex items-start justify-between px-4 py-4 text-xs font-black uppercase tracking-[0.18em] md:px-8 ${open ? "nav-open bg-ink text-paper mix-blend-normal" : mediaOpen ? "nav-media-open bg-transparent text-white mix-blend-normal" : "text-white mix-blend-difference"}`}>
      <Link href="/" className="nav-mark" aria-label="Return to project index">
        Madeline Barbush
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
