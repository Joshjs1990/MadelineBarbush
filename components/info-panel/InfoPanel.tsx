"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { actorInfo } from "@/data/projects";

type InfoPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function InfoPanel({ open, onClose }: InfoPanelProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          className="info-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="info-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button className="info-close" type="button" onClick={onClose} aria-label="Close information panel" data-cursor-label="Close">
            CLOSE
          </button>
          <motion.div
            className="info-panel__inner"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.65, ease: [0.77, 0, 0.18, 1] }}
          >
            <div className="info-panel__image">
              <Image src="/images/actor-wide.png" alt="Wide editorial portrait of the actor in a domestic interior." fill sizes="(max-width: 768px) 100vw, 42vw" unoptimized />
            </div>
            <div className="info-panel__content">
              <p className="eyebrow">Information</p>
              <h2 id="info-title">{actorInfo.name}</h2>
              <p className="info-bio">{actorInfo.bio}</p>
              <dl className="info-grid">
                <div><dt>Location</dt><dd>{actorInfo.location}</dd></div>
                <div><dt>Playing age</dt><dd>{actorInfo.playingAge}</dd></div>
                <div><dt>Languages</dt><dd>{actorInfo.languages}</dd></div>
                <div><dt>Skills</dt><dd>{actorInfo.skills}</dd></div>
                <div><dt>Representation</dt><dd>{actorInfo.representation}</dd></div>
              </dl>
              <div className="info-actions">
                <a href="/downloads/cv.txt" download data-cursor-label="Open">Download CV</a>
                <a href="/downloads/headshots.txt" download data-cursor-label="Open">Download headshots</a>
                <a href={`mailto:${actorInfo.email}`} data-cursor-label="Email">Email</a>
                <a href={actorInfo.instagram} target="_blank" rel="noreferrer" data-cursor-label="Open">Instagram</a>
                <a href={actorInfo.imdb} target="_blank" rel="noreferrer" data-cursor-label="Open">IMDb</a>
                <a href={actorInfo.spotlight} target="_blank" rel="noreferrer" data-cursor-label="Open">Spotlight</a>
              </div>
            </div>
          </motion.div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
