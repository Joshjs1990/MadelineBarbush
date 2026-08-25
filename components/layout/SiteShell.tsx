"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { actorInfo } from "@/data/projects";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { SiteNav } from "@/components/navigation/SiteNav";
import type { EditableContent } from "@/lib/assistant/registry";

type SiteShellProps = {
  children: ReactNode;
  content: EditableContent;
};

export function SiteShell({ children, content }: SiteShellProps) {
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
      <SiteNav onInfo={() => setInfoOpen(true)} />
      <div className="site-shell">
        {children}
        <SiteFooter content={content} />
      </div>
      <div className="crt-overlay" aria-hidden="true" />
    </>
  );
}

function SiteFooter({ content }: { content: EditableContent }) {
  return (
    <footer className="site-footer" aria-labelledby="footer-title">
      <div>
        <p className="eyebrow">Contact</p>
        <h2 id="footer-title"><span>Madeline</span><span>Barbush</span></h2>
      </div>
      <div className="site-footer__contact">
        <p>For roles, collaborations and representation enquiries.</p>
        <a href={`mailto:${content.contact.email}`} data-cursor-label="Email">
          {content.contact.email}
        </a>
        <nav className="site-footer__links" aria-label="External profiles">
          <a href={actorInfo.instagram} target="_blank" rel="noreferrer">Instagram</a>
          <a href={actorInfo.actorsAccess} target="_blank" rel="noreferrer">Actors Access</a>
          <a href={actorInfo.imdb} target="_blank" rel="noreferrer">IMDb</a>
        </nav>
      </div>
      <dl className="site-footer__meta">
        <div>
          <dt>Location</dt>
          <dd>{content.home.location}</dd>
        </div>
        <div>
          <dt>Representation</dt>
          <dd>{actorInfo.representation}</dd>
        </div>
      </dl>
      <p className="site-footer__mark">
        <span>© {new Date().getFullYear()} {actorInfo.name}</span>
        <a
          href="https://thecoolmoon.com"
          target="_blank"
          rel="noreferrer"
          data-cursor-label="TheCoolMoon"
        >
          by TheCoolMoon
        </a>
      </p>
    </footer>
  );
}
