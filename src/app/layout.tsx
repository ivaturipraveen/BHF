import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { headers } from "next/headers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PublicChrome } from "@/components/PublicChrome";
import PlausibleScript from "@/components/PlausibleScript";
import SentryInit from "@/components/SentryInit";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.length > 0
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Bharatiya Heritage Foundation",
  description:
    "A thriving home for Bharatiya heritage in Solano County — building community, celebrating culture, and empowering the next generation through dharmic values.",
  icons: {
    icon: [
      { url: "/brand/bhf-logo.jpg", type: "image/jpeg" },
    ],
    apple: [{ url: "/brand/bhf-logo.jpg" }],
  },
  openGraph: {
    images: [
      {
        url: "/brand/bhf-logo.jpg",
        width: 1600,
        height: 1600,
        alt: "Bharatiya Heritage Foundation",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Privacy: don't render Plausible for /admin routes — see middleware.ts,
  // which sets `x-pathname` on every request.
  const pathname = headers().get("x-pathname") ?? "";
  const isAdmin = pathname.startsWith("/admin");
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-white font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-50 bg-saffron text-white px-4 py-2 rounded font-medium"
        >
          Skip to main content
        </a>
        {!isAdmin && <PlausibleScript />}
        <SentryInit />
        <PublicChrome>
          <Navbar />
        </PublicChrome>
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
        <PublicChrome>
          <Footer />
        </PublicChrome>
      </body>
    </html>
  );
}
