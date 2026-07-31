"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { actorInfo } from "@/data/projects";
import { InfoPanel } from "@/components/info-panel/InfoPanel";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { PageTransition } from "@/components/motion/PageTransition";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { SiteNav } from "@/components/navigation/SiteNav";

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    const isInitialRender = previousPathname.current === pathname;
    previousPathname.current = pathname;

    // Keep intentional in-page navigation (such as /#reel) under browser control.
    if (isInitialRender || window.location.hash) {
      return;
    }

    const reset = () => {
      window.dispatchEvent(new Event("force-scroll-top"));
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    reset();
    requestAnimationFrame(reset);
    const timer = window.setTimeout(reset, 80);
    const lateTimer = window.setTimeout(reset, 300);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(lateTimer);
    };
  }, [pathname]);

  return (
    <>
      <SmoothScroll />
      <CustomCursor />
      <PageTransition />
      <SiteNav onInfo={() => setInfoOpen(true)} />
      {children}
      <SiteFooter />
      <InfoPanel open={infoOpen} onClose={() => setInfoOpen(false)} />
      <div className="crt-overlay" aria-hidden="true" />
    </>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer" aria-labelledby="footer-title">
      <div>
        <p className="eyebrow">Contact</p>
        <h2 id="footer-title">{actorInfo.name}</h2>
      </div>
      <div className="site-footer__contact">
        <p>For roles, collaborations and representation enquiries.</p>
        <a href={`mailto:${actorInfo.email}`} data-cursor-label="Email">
          {actorInfo.email}
        </a>
      </div>
      <dl className="site-footer__meta">
        <div>
          <dt>Location</dt>
          <dd>{actorInfo.location}</dd>
        </div>
        <div>
          <dt>Representation</dt>
          <dd>{actorInfo.representation}</dd>
        </div>
      </dl>
    </footer>
  );
}
