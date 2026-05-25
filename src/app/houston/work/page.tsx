import type { Metadata } from "next";
import { WorkPage } from "@/components/pages/WorkPage";

export const metadata: Metadata = {
  title: "Work — NRG Houston",
  description: "Portfolio of websites built for Houston small businesses — restaurants, HVAC, law offices, and more.",
  alternates: { canonical: "https://nrgwebsites.com/houston/work" },
};

export default function HoustonWorkPage() {
  return <WorkPage location="houston" />;
}
