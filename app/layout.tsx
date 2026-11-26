import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Amiri, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VisitTracker from "@/components/VisitTracker";
import BackToTop from "@/components/BackToTop";
import SkipLink from "@/components/SkipLink";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const THEME_INIT = `try{var p=JSON.parse(localStorage.getItem("al-ilm-reading")||"null");var t=p&&p.theme;if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;

export const metadata: Metadata = {
  // Absolute base so relative Open Graph image URLs resolve for link previews.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://al-ilm-omega.vercel.app"),
  title: "Al-Ilm — Quran Verses",
  description: "Discover Quran verses by theme. Daily verse, category browsing, and more.",
  openGraph: { siteName: "Al-Ilm", type: "website" },
  twitter: { card: "summary" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${amiri.variable} ${cormorant.variable} h-full`}
    >
      <head>
        {/* Apply a saved light/dark choice before first paint to avoid a flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-ink antialiased">
        <LanguageProvider>
          <SkipLink />
          <VisitTracker />
          <Navbar />
          <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
          <Footer />
          <BackToTop />
        </LanguageProvider>
      </body>
    </html>
  );
}
