const allowedTags = new Set(["P", "H2", "H3", "STRONG", "EM", "A", "BR"]);

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
}

/** Keep the editor deliberately small: inline emphasis, safe links and breaks only. */
export function sanitizeRichText(input: string) {
  return input
    .replace(/<!--([\s\S]*?)-->/g, "")
    .replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (full, tag: string, attrs: string) => {
      const upper = tag.toUpperCase();
      if (!allowedTags.has(upper)) return "";
      if (full.startsWith("</")) return `</${tag.toLowerCase()}>`;
      if (upper === "BR") return "<br>";
      if (upper !== "A") return `<${tag.toLowerCase()}>`;
      const href = attrs.match(/href\s*=\s*["']([^"']+)["']/i)?.[1] ?? "";
      if (!/^(https?:\/\/|mailto:)/i.test(href)) return "<a>";
      return `<a href="${href.replace(/&/g, "&amp;").replace(/\"/g, "&quot;")}" rel="noreferrer">`;
    })
    .trim()
    .slice(0, 10000);
}

export function richTextHtml(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return sanitizeRichText(trimmed);
  return trimmed
    .split(/\n\s*\n/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function richTextPreview(value: string) {
  return richTextHtml(value).replace(/<[^>]+>/g, "").trim();
}
