import type { Metadata, Viewport } from "next";
import { Syne, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

// viewport-fit=cover required for env(safe-area-inset-*) values to be
// non-zero on iPhone — without this, the FloatingCta and Footer safe-area
// padding fixes are no-ops.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NRG — Web Design & Automation for Small Businesses",
  description:
    "Custom websites, automation, and local SEO for small businesses. Real results, no agency fluff.",
  metadataBase: new URL("https://nrgwebsites.com"),
  openGraph: {
    title: "NRG — Web Design & Automation for Small Businesses",
    description:
      "Custom websites, automation, and local SEO for small businesses. Real results, no agency fluff.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
