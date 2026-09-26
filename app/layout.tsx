import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { getSiteSettings } from "@/lib/data";
import { splitKeywords } from "@/lib/seo";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
