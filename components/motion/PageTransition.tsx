"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Black liquid wipe between routes.
 *
 * Covers *before* navigating rather than after. Reacting to `usePathname` alone
 * meant the new page painted first and the wipe then swept over content the
 * viewer had already seen — page, pause, wipe, page again. So internal link
 * clicks are intercepted: the veil closes over the current page, the router
 * pushes while the screen is black, and the veil opens on the new one. The
 * loading gap now happens behind the veil instead of in front of it.
 *
 * Clicks are caught once on the document rather than through a wrapper link
 * component, so every internal link transitions without opting in.
 *
 * The veil is driven by DOM classes rather than React state: the animation is a
 * browser concern, and routing it through state would re-render the tree on
 * every step of something the compositor already handles.
 */

/** Matches the CSS. If the route resolves sooner, the veil still waits. */
const COVER_MS = 700;
/** Longest the veil will stay closed if a route never resolves. */
const FAILSAFE_MS = 5000;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** The admin is a tool, not a showpiece — it stays instant. */
function isAdmin(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function PageTransition() {
  const pathname = usePathname();
  const router = useRouter();

  const veilRef = useRef<HTMLDivElement>(null);
  const previousPathname = useRef(pathname);
  const pendingPath = useRef<string | null>(null);
  const coverTimer = useRef<number | undefined>(undefined);
  const failsafeTimer = useRef<number | undefined>(undefined);

  // Opens the veil once the new route has committed.
  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;

    const veil = veilRef.current;
    const wasCovered = pendingPath.current !== null;
    pendingPath.current = null;
    window.clearTimeout(failsafeTimer.current);

    if (!veil || prefersReducedMotion()) return;
    if (isAdmin(pathname)) {
      veil.className = "page-veil";
      return;
    }

    // A navigation we did not intercept — back, forward, or a redirect — has no
    // cover to open, so it gets the single pass across instead.
    veil.classList.remove("is-covering", "is-opening", "is-sweeping");
    void veil.offsetWidth;
    veil.classList.add(wasCovered ? "is-opening" : "is-sweeping");
  }, [pathname]);

  // Intercepts internal link clicks so the veil can close first.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor) return;
      if (anchor.hasAttribute("download") || anchor.dataset.noTransition !== undefined) return;

      const target = anchor.getAttribute("target");
      if (target && target !== "_self") return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      // Anything off-site, non-http, or staying on this route (an in-page hash)
      // is left to the browser.
      if (url.origin !== window.location.origin) return;
      if (url.protocol !== "http:" && url.protocol !== "https:") return;
      if (url.pathname === window.location.pathname) return;

      if (isAdmin(url.pathname) || isAdmin(window.location.pathname)) return;

      const veil = veilRef.current;
      if (!veil || prefersReducedMotion()) return;

      event.preventDefault();

      const destination = `${url.pathname}${url.search}${url.hash}`;
      pendingPath.current = destination;

      veil.classList.remove("is-opening", "is-sweeping");
      void veil.offsetWidth;
      veil.classList.add("is-covering");

      // Push once the screen is black. Prefetching has usually already run, so
      // the route is often ready by the time the veil finishes closing.
      window.clearTimeout(coverTimer.current);
      coverTimer.current = window.setTimeout(() => router.push(destination), COVER_MS);

      // Never leave someone stranded behind a black screen.
      window.clearTimeout(failsafeTimer.current);
      failsafeTimer.current = window.setTimeout(() => {
        pendingPath.current = null;
        veil.classList.remove("is-covering");
        veil.classList.add("is-opening");
      }, FAILSAFE_MS);
    };

    // Capture phase: `Link` runs its own click handler and bails when the event
    // is already default-prevented, so preventing it here before React's root
    // listener sees it hands routing to this component. Propagation is left
    // alone, so the other handlers on those links — closing the mobile menu —
    // still run.
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.clearTimeout(coverTimer.current);
      window.clearTimeout(failsafeTimer.current);
    };
  }, [router]);

  return (
    <div
      ref={veilRef}
      className="page-veil"
      aria-hidden="true"
      onAnimationEnd={(event) => {
        // Closing holds; opening and sweeping clear themselves.
        if (event.currentTarget.classList.contains("is-covering")) return;
        event.currentTarget.classList.remove("is-opening", "is-sweeping");
      }}
    />
  );
}
