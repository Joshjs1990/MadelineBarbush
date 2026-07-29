import type { Metadata } from "next";
import { Archivo, Oswald } from "next/font/google";
import "./globals.css";
import { absoluteUrl } from "@/lib/utils";

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
    default: "M. Bar | Actor Portfolio",
    template: "%s | M. Bar",
  },
  description:
    "Selected film, television, theatre and experimental performance work for a professional actor. Placeholder content for an editable portfolio.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "M. Bar | Actor Portfolio",
    description:
      "A bold project-first actor portfolio for film, television and stage work.",
    url: "/",
    siteName: "M. Bar",
    images: [{ url: "/images/actor-close.png", width: 1018, height: 1536 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "M. Bar | Actor Portfolio",
    description:
      "Selected film, television, theatre and experimental performance work.",
    images: ["/images/actor-close.png"],
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
        {children}
      </body>
    </html>
  );
}
