"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Project } from "@/types/project";
import { motionDurations, motionEases } from "@/lib/motion/config";
import { getGsap } from "@/lib/motion/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type TransitionPhase = "idle" | "covering" | "navigating" | "revealing";

type ProjectTransitionInput = {
  href: string;
  project: Project;
};

type MotionContextValue = {
  phase: TransitionPhase;
  startProjectTransition: (input: ProjectTransitionInput) => void;
  isTransitioning: boolean;
};

const MotionContext = createContext<MotionContextValue | null>(null);

type OverlayState = {
  project: Project;
  href: string;
};

export function MotionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [overlay, setOverlay] = useState<OverlayState | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const pendingHrefRef = useRef<string | null>(null);
  const lockedRef = useRef(false);

  const unlock = useCallback(() => {
    document.documentElement.classList.remove("is-transitioning");
    document.body.classList.remove("is-transitioning");
    lockedRef.current = false;
  }, []);

  const clearOverlay = useCallback(() => {
    unlock();
    pendingHrefRef.current = null;
    setOverlay(null);
    setPhase("idle");
  }, [unlock]);

  const revealOverlay = useCallback(() => {
    const overlayEl = overlayRef.current;
    const panelEl = panelRef.current;
    const titleEl = titleRef.current;

    if (!overlayEl || !panelEl || !titleEl) {
      clearOverlay();
      return;
    }

    const { gsap } = getGsap();
    setPhase("revealing");
    window.dispatchEvent(new Event("force-scroll-top"));

    const timeline = gsap.timeline({ onComplete: clearOverlay });
    timeline
      .to(titleEl, { yPercent: -12, opacity: 0, duration: motionDurations.quick, ease: motionEases.soft }, 0)
      .to(panelEl, { yPercent: -104, duration: motionDurations.reveal, ease: motionEases.reveal }, 0.08)
      .to(overlayEl, { autoAlpha: 0, duration: motionDurations.quick }, 0.42);
  }, [clearOverlay]);

  const startProjectTransition = useCallback(
    ({ href, project }: ProjectTransitionInput) => {
      if (lockedRef.current) {
        return;
      }

      if (reducedMotion) {
        window.dispatchEvent(new Event("force-scroll-top"));
        router.push(href, { scroll: true });
        return;
      }

      lockedRef.current = true;
      pendingHrefRef.current = href;
      document.documentElement.classList.add("is-transitioning");
      document.body.classList.add("is-transitioning");
      setPhase("covering");
      setOverlay({ project, href });
    },
    [reducedMotion, router],
  );

  useEffect(() => {
    if (!overlay || phase !== "covering") {
      return;
    }

    const overlayEl = overlayRef.current;
    const panelEl = panelRef.current;
    const titleEl = titleRef.current;

    if (!overlayEl || !panelEl || !titleEl) {
      return;
    }

    const { gsap } = getGsap();
    gsap.set(overlayEl, { autoAlpha: 1 });
    gsap.set(panelEl, {
      yPercent: 104,
      backgroundColor: overlay.project.accentColor,
      clipPath: "inset(0 0 0 0)",
    });
    gsap.set(titleEl, { y: 34, opacity: 0 });

    const timeline = gsap.timeline({
      defaults: { ease: motionEases.reveal },
      onComplete: () => {
        setPhase("navigating");
        window.dispatchEvent(new Event("force-scroll-top"));
        router.push(overlay.href, { scroll: true });
      },
    });

    timeline
      .to(panelEl, { yPercent: 0, duration: motionDurations.cover })
      .to(titleEl, { y: 0, opacity: 1, duration: motionDurations.soft, ease: motionEases.soft }, 0.34);

    return () => {
      timeline.kill();
      if (pendingHrefRef.current === overlay.href && phase === "covering") {
        unlock();
      }
    };
  }, [overlay, phase, router, unlock]);

  useEffect(() => {
    if (!pendingHrefRef.current || phase !== "navigating") {
      return;
    }

    const targetPath = new URL(pendingHrefRef.current, window.location.origin).pathname;
    if (pathname !== targetPath) {
      return;
    }

    const timer = window.setTimeout(revealOverlay, 90);
    return () => window.clearTimeout(timer);
  }, [pathname, phase, revealOverlay]);

  const contextValue = useMemo<MotionContextValue>(
    () => ({
      phase,
      startProjectTransition,
      isTransitioning: phase !== "idle",
    }),
    [phase, startProjectTransition],
  );

  return (
    <MotionContext.Provider value={contextValue}>
      {children}
      {overlay ? (
        <div ref={overlayRef} className="transition-overlay" aria-hidden="true" data-phase={phase}>
          <div ref={panelRef} className="transition-overlay__panel">
            <div ref={titleRef} className="transition-overlay__title">
              <span>{overlay.project.type}</span>
              <strong>{overlay.project.title}</strong>
            </div>
          </div>
        </div>
      ) : null}
    </MotionContext.Provider>
  );
}

export function useMotionContext() {
  const context = useContext(MotionContext);

  if (!context) {
    throw new Error("useMotionContext must be used inside MotionProvider");
  }

  return context;
}

export function shouldIgnoreTransitionClick(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey
  );
}
