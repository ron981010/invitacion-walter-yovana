import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { wedding } from "./wedding";

const poiret = localFont({
  src: "./fonts/poiret-one.woff2",
  variable: "--font-poiret",
  display: "swap",
});

const cinzel = localFont({
  src: "./fonts/cinzel.woff2",
  variable: "--font-cinzel",
  display: "swap",
});

const romanticLovely = localFont({
  src: "./fonts/romantic-lovely.ttf",
  variable: "--font-romantic",
  display: "swap",
});

const nathalia = localFont({
  src: "./fonts/nathalia.ttf",
  variable: "--font-nathalia",
  display: "swap",
});

const cormorantInfant = localFont({
  src: "./fonts/cormorant-infant.woff2",
  variable: "--font-cormorant-infant",
  display: "swap",
});

const raleway = localFont({
  src: "./fonts/raleway-300.ttf",
  variable: "--font-raleway",
  weight: "300",
  display: "swap",
});

const title = `Nuestra boda · ${wedding.names}`;
const description = wedding.description;
const siteUrl = wedding.siteUrl;
const socialImage = `${siteUrl}/og-nuestra-boda.png`;

export const metadata: Metadata = {
  metadataBase: new URL(`${siteUrl}/`),
  title,
  description,
  alternates: { canonical: siteUrl },
  icons: {
    icon: `${siteUrl}/assets/seal.webp`,
    shortcut: `${siteUrl}/assets/seal.webp`,
  },
  openGraph: {
    title,
    description,
    type: "website",
    locale: "es_PE",
    url: siteUrl,
    siteName: wedding.names,
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: `Nuestra boda · ${wedding.names} · ${wedding.footerDate}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${poiret.variable} ${cinzel.variable} ${romanticLovely.variable} ${nathalia.variable} ${cormorantInfant.variable} ${raleway.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
