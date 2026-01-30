import type React from "react";
import type { Metadata, Viewport } from "next";
import { Faustina, Chivo } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const faustina = Faustina({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-faustina",
});

const chivo = Chivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-chivo",
});

export const metadata: Metadata = {
  title:
    "CATSO AV - Productora de Video Profesional | Videoclips, Fotografía y Contenido Digital",
  metadataBase: new URL("https://catsoav.com"),
  description:
    "CATSO AV es una productora de video profesional especializada en videoclips musicales, fotografía de productos, contenido para redes sociales, aftermovies de discotecas y DJ sets. Servicios audiovisuales de alta calidad.",
  keywords: [
    "productora de video",
    "videoclips musicales",
    "fotografía profesional",
    "contenido redes sociales",
    "aftermovies discotecas",
    "DJ sets",
    "producción audiovisual",
    "CATSO AV",
    "video marketing",
    "contenido digital",
  ],
  authors: [{ name: "CATSO AV" }],
  creator: "CATSO AV",
  publisher: "CATSO AV",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://catsoav.com",
    siteName: "CATSO AV",
    title: "CATSO AV - Productora de Video Profesional",
    description:
      "Productora de video especializada en videoclips musicales, fotografía de productos, contenido para redes sociales y aftermovies. Servicios audiovisuales profesionales.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CATSO AV - Productora de Video Profesional",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CATSO AV - Productora de Video Profesional",
    description:
      "Servicios audiovisuales profesionales: videoclips, fotografía, contenido digital y más.",
    images: ["/og-image.jpg"],
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "business",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/catsoav.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/catsoav.png",
  },
  alternates: {
    canonical: "https://catsoav.com",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#dc2626",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${faustina.variable} ${chivo.variable}`} suppressHydrationWarning>
      <body className="antialiased font-sans" suppressHydrationWarning={true}>
        {/* Schema WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              url: "https://catsoav.com",
              name: "CATSO AV",
              alternateName: "Catso AudioVisual",
            }),
          }}
        />

        {/* Schema Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "CATSO AV",
              description:
                "Productora de video profesional especializada en videoclips musicales, fotografía y contenido digital",
              url: "https://catsoav.com",
              logo: "https://catsoav.com/logo.png",
              sameAs: ["https://catsoav.myportfolio.com"],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                availableLanguage: ["Spanish", "English"],
              },
              areaServed: "Worldwide",
              serviceType: [
                "Video Production",
                "Music Video Production",
                "Photography",
                "Social Media Content",
                "Event Videography",
              ],
            }),
          }}
        />
        <Providers>
          {children}
        </Providers>

        {/* Global SVG Filters */}
        <svg style={{ width: 0, height: 0, position: 'absolute', pointerEvents: 'none' }} aria-hidden="true">
          <defs>
            <filter id="burning-paper" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="noise" seed="1">
                <animate attributeName="seed" from="1" to="100" dur="0.8s" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="35" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
      </body>
    </html>
  );
}
