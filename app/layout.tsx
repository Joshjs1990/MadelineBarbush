import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Archivo, Oswald } from "next/font/google";
import "./globals.css";
import { absoluteUrl } from "@/lib/utils";
import { SiteShell } from "@/components/layout/SiteShell";
import { getEditableContent } from "@/lib/assistant/store";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  display: "swap",
});

const baseMetadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: {
    default: "Madeleline Barbush | Actor Portfolio",
    template: "%s | Madeleline Barbush",
  },
  description:
    "Selected film, television, theatre and experimental performance work for a professional actor.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Madeleline Barbush | Actor Portfolio",
    description:
      "A bold project-first actor portfolio for film, television and stage work.",
    url: "/",
    siteName: "Madeleline Barbush",
    images: [{ url: "/images/actor-close.jpg", width: 1018, height: 1536 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Madeleline Barbush | Actor Portfolio",
    description:
      "Selected film, television, theatre and experimental performance work.",
    images: ["/images/actor-close.jpg"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const content = await getEditableContent();
  return { ...baseMetadata, description: content.seo.description, openGraph: { ...baseMetadata.openGraph, description: content.seo.description }, twitter: { ...baseMetadata.twitter, description: content.seo.description } };
}

function headingFontValue(font: string) {
  if (font === "Archivo") return "var(--font-archivo)";
  if (font === "Arial") return "Arial, Helvetica, sans-serif";
  if (font === "Georgia") return "Georgia, serif";
  return undefined;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getEditableContent();
  const headingFont = headingFontValue(content.theme.headingFont);
  const themeStyle = { "--acid": content.theme.accentColor, ...(headingFont ? { "--font-oswald": headingFont } : {}) } as CSSProperties;
  return (
    <html lang="en">
      <body className={`${archivo.variable} ${oswald.variable} antialiased`} style={themeStyle}>
        <SiteShell content={content}>{children}</SiteShell>
      </body>
    </html>
  );
}
