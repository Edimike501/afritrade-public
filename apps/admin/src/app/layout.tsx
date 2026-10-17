import type { ReactNode } from "react";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { AdminShell } from "@/components/AdminShell";

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

export const metadata = {
  title: "AfriTrade Connect — Admin Operations",
  description: "Operations, verification queue, logistics management, and order oversight.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${bricolageGrotesque.variable} ${notoSans.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)theme=([^;]*)/);var t=m?decodeURIComponent(m[1]):null;if(t==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        <Providers>
          <AdminShell>{children}</AdminShell>
        </Providers>
      </body>
    </html>
  );
}
