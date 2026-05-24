import type { Metadata } from "next";
import { WorkPage } from "@/components/pages/WorkPage";

export const metadata: Metadata = {
  title: "Work — NRG Houston",
  description: "Web design projects for Houston businesses.",
  alternates: { canonical: "https://nrgwebsites.com/houston/work" },
};

export default function HoustonWorkPage() {
  return <WorkPage location="houston" />;
}
