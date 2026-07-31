"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Swipe-left transition between routes.
 *
 * The App Router commits the new page before this runs, so the veil is a cover
 * pass rather than a hand-off: it sweeps in from the right over the freshly
 * rendered page, holds for a beat, then carries on off to the left to reveal it.
 * Driven by `usePathname` instead of intercepting link clicks, so it covers
 * every navigation — nav links, project rows, back and forward — without each
 * one needing to know about it.
 *
 * The veil is always mounted and animated by toggling a class, rather than by
 * remounting on a state change: the animation is a DOM effect, and driving it
 * through React state would re-render the tree on every navigation for
 * something the browser can do on its own.
 */
export function PageTransition() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const veilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;

    const veil = veilRef.current;
    if (!veil) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Removing the class and forcing a reflow before re-adding it restarts the
    // animation; without the reflow a fast second navigation is ignored.
    veil.classList.remove("is-running");
    void veil.offsetWidth;
    veil.classList.add("is-running");
  }, [pathname]);

  return (
    <div
      ref={veilRef}
      className="page-swipe"
      aria-hidden="true"
      onAnimationEnd={(event) => event.currentTarget.classList.remove("is-running")}
    />
  );
}
