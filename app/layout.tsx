import type { Metadata } from "next";
import { Archivo, Oswald } from "next/font/google";
import "./globals.css";
import { absoluteUrl } from "@/lib/utils";
import { SiteShell } from "@/components/layout/SiteShell";

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

export const metadata: Metadata = {
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${archivo.variable} ${oswald.variable} antialiased`}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
