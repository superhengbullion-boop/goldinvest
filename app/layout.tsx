import type { Metadata } from "next";
import localFont from "next/font/local";
import { getSiteSettings } from "@/lib/data";
import { splitKeywords } from "@/lib/seo";
import "./globals.css";

const dmSans = localFont({
  src: [
    { path: "./fonts/dm-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/dm-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/dm-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/dm-sans-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-dm-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  const keywords = splitKeywords(site.keywords);
  return {
    title: {
      default: site.title,
      template: `%s | ${site.siteName}`,
    },
    description: site.description,
    ...(keywords.length > 0 ? { keywords } : {}),
    icons: site.logo ? { icon: site.logo, apple: site.logo } : undefined,
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-ivory font-sans">
        {children}
      </body>
    </html>
  );
}
