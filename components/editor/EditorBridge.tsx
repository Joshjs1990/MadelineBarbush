"use client";

import { useEffect } from "react";

export function EditorBridge() {
  useEffect(() => {
    const inEditor = window.top !== window.self && new URLSearchParams(window.location.search).get("editor") === "1";
    if (!inEditor) return;
    document.body.classList.add("editor-preview");
    const editable = Array.from(document.querySelectorAll<HTMLElement>("[data-editable-field]"));
    const select = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      const target = event.currentTarget as HTMLElement;
      window.parent.postMessage({ type: "editor-select", field: target.dataset.editableField, kind: target.dataset.editableKind }, window.location.origin);
    };
    editable.forEach((element) => element.addEventListener("click", select));
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || !event.data) return;
      if (event.data.type === "editor-preview-all") {
        const values = event.data.values as Record<string, string> | undefined;
        Object.entries(values ?? {}).forEach(([field, value]) => {
          const element = document.querySelector<HTMLElement>(`[data-editable-field="${CSS.escape(field)}"]`);
          if (element && element.dataset.editableKind === "text") element.textContent = value;
          else if (element && element.dataset.editableKind !== "image") element.innerHTML = value;
        });
        const media = event.data.media as Record<string, { src: string; focalX: number; focalY: number }> | undefined;
        Object.entries(media ?? {}).forEach(([field, image]) => {
          const element = document.querySelector<HTMLImageElement>(`[data-editable-field="${CSS.escape(field)}"]`);
          if (element) { element.src = image.src; element.style.objectPosition = `${image.focalX}% ${image.focalY}%`; }
        });
        const textSizing = event.data.textSizing as Record<string, string> | undefined;
        document.querySelectorAll<HTMLElement>("[data-editable-kind=richText]").forEach((element) => {
          const value = textSizing?.[element.dataset.editableField ?? ""];
          if (value) element.style.setProperty("--editor-font-size", value);
          else element.style.removeProperty("--editor-font-size");
        });
      }
      if (event.data.type === "editor-mode") document.body.classList.toggle("editor-preview", event.data.enabled !== false);
    };
    window.addEventListener("message", receive);
    return () => { editable.forEach((element) => element.removeEventListener("click", select)); window.removeEventListener("message", receive); document.body.classList.remove("editor-preview"); };
  }, []);
  return null;
}
