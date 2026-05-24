import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NRG — Web Design & Automation for Houston Small Businesses",
  description:
    "Custom websites, automation, and local SEO built for Houston restaurants, trades, and salons. Real results, no agency fluff.",
  metadataBase: new URL("https://nrg.example.com"),
  openGraph: {
    title: "NRG — Web Design & Automation for Houston Small Businesses",
    description:
      "Custom websites, automation, and local SEO built for Houston restaurants, trades, and salons.",
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
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
