import type { Metadata } from "next";
import { WorkPage } from "@/components/pages/WorkPage";

export const metadata: Metadata = {
  title: "Work — NRG Texas",
  description: "Web design projects for Texas businesses.",
  alternates: { canonical: "https://nrgwebsites.com/texas/work" },
};

export default function TexasWorkPage() {
  return <WorkPage location="texas" />;
}
