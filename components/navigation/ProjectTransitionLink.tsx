"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import type { Project } from "@/types/project";
import { shouldIgnoreTransitionClick, useMotionContext } from "@/components/motion/MotionProvider";

type ProjectTransitionLinkProps = {
  href: string;
  project: Project;
  children: ReactNode;
  className?: string;
  "data-cursor-label"?: string;
  "aria-label"?: string;
};

export function ProjectTransitionLink({
  href,
  project,
  children,
  ...props
}: ProjectTransitionLinkProps) {
  const { startProjectTransition, isTransitioning } = useMotionContext();

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (shouldIgnoreTransitionClick(event) || isTransitioning || href.includes("#")) {
      return;
    }

    event.preventDefault();
    sessionStorage.setItem("scroll-to-top", "true");
    startProjectTransition({
      href,
      project,
    });
  };

  return (
    <Link {...props} href={href} scroll onClick={onClick} aria-disabled={isTransitioning}>
      {children}
    </Link>
  );
}
