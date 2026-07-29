"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export function IntroSequence() {
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || sessionStorage.getItem("mbar-intro-seen")) {
      return;
    }

    sessionStorage.setItem("mbar-intro-seen", "true");
    const showTimer = window.setTimeout(() => setVisible(true), 0);
    const timer = window.setTimeout(() => setVisible(false), 1700);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(timer);
    };
  }, [reduceMotion]);

  if (!visible) {
    return null;
  }

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-0 z-[80] grid place-items-center bg-ink text-paper"
      initial={{ y: 0 }}
      animate={{ y: "-100%" }}
      transition={{ delay: 1.05, duration: 0.65, ease: [0.77, 0, 0.18, 1] }}
    >
      <motion.div
        className="intro-slate"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <span>Take 01</span>
        <strong>M. BAR</strong>
      </motion.div>
    </motion.div>
  );
}
