"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { getGsap } from "@/lib/motion/gsap";

export function SmoothScroll() {
  useEffect(() => {
    const { gsap, ScrollTrigger } = getGsap();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 0.85,
      touchMultiplier: 1,
    });

    const forceTop = () => {
      lenis.scrollTo(0, { immediate: true, force: true });
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      ScrollTrigger.update();
    };

    const updateScrollTrigger = () => ScrollTrigger.update();
    const tick = (time: number) => lenis.raf(time * 1000);

    lenis.on("scroll", updateScrollTrigger);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    window.addEventListener("force-scroll-top", forceTop);

    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts) {
      document.fonts.ready.then(refresh).catch(refresh);
    } else {
      window.setTimeout(refresh, 250);
    }

    return () => {
      window.removeEventListener("force-scroll-top", forceTop);
      lenis.off("scroll", updateScrollTrigger);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
