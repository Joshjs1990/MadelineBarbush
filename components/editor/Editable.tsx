import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { richTextHtml } from "@/lib/content/rich-text";

export function EditableText({ field, children, className }: { field: string; children: ReactNode; className?: string }) {
  return <span className={className} data-editable-field={field} data-editable-kind="text">{children}</span>;
}

export function EditableRichText({ field, value, className }: { field: string; value: string; className?: string }) {
  return <div className={className} data-editable-field={field} data-editable-kind="richText" dangerouslySetInnerHTML={{ __html: richTextHtml(value) }} />;
}

export function EditableImage({ field, src, alt, focalX = 50, focalY = 50, fit = "cover", className, fill, sizes, priority = false }: { field: string; src: string; alt: string; focalX?: number; focalY?: number; fit?: "cover" | "contain"; className?: string; fill?: boolean; sizes?: string; priority?: boolean }) {
  const style = { objectPosition: `${focalX}% ${focalY}%`, objectFit: fit } as CSSProperties;
  return <Image className={className} data-editable-field={field} data-editable-kind="image" src={src} alt={alt} fill={fill} sizes={sizes} width={fill ? undefined : 1200} height={fill ? undefined : 1200} style={style} priority={priority} unoptimized />;
}
