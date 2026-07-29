"use client";

import { useEffect, useState } from "react";

export function CustomCursor() {
  const [label, setLabel] = useState("View");

  useEffect(() => {
    const pointerFine = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!pointerFine || reduceMotion) {
      return;
    }

    const cursor = document.querySelector<HTMLElement>("[data-cursor]");
    if (!cursor) {
      return;
    }

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let currentX = x;
    let currentY = y;
    let raf = 0;

    const move = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      const target = event.target as HTMLElement | null;
      const nextLabel = target?.closest<HTMLElement>("[data-cursor-label]")?.dataset.cursorLabel;
      setLabel(nextLabel ?? "View");
    };

    const tick = () => {
      currentX += (x - currentX) * 0.18;
      currentY += (y - currentY) * 0.18;
      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", move);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div data-cursor className="pointer-events-none fixed left-0 top-0 z-[70] hidden h-16 w-16 items-center justify-center rounded-full border border-ink bg-paper/90 text-[0.62rem] font-black uppercase tracking-[0.18em] text-ink mix-blend-difference md:flex">
      {label}
    </div>
  );
}
