import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { siteConfig } from "@/config/site";
import localFont from "next/font/local";
import { Providers } from "@/components/Providers";
import { NavigationWrapper } from "@/components/NavigationWrapper";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";

const bricolageGrotesque = localFont({
  src: "../fonts/bricolage-grotesque.woff2",
  variable: "--font-bricolage",
  display: "swap",
  weight: "200 800",
});

const notoSans = localFont({
  src: "../fonts/noto-sans.woff2",
  variable: "--font-noto-sans",
  display: "swap",
  weight: "100 900",
});

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: siteConfig.authors,
  creator: siteConfig.creator,
  publisher: siteConfig.publisher,
  applicationName: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — Intra-African B2B Trade Marketplace`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
    images: ["/opengraph-image.png"],
  },
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
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${bricolageGrotesque.variable} ${notoSans.variable}`} suppressHydrationWarning>
      <head>
        <OrganizationJsonLd />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)theme=([^;]*)/);var t=m?decodeURIComponent(m[1]):null;if(t==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        <Providers>
          <NavigationWrapper>{children}</NavigationWrapper>
        </Providers>
      </body>
    </html>
  );
}
