import type { Metadata } from "next";
import { WorkPage } from "@/components/pages/WorkPage";

export const metadata: Metadata = {
  title: "Work — NRG Texas",
  description: "Portfolio of websites built for Texas small businesses — restaurants, HVAC, law offices, and more. Houston-based, working statewide.",
  alternates: { canonical: "https://nrgwebsites.com/texas/work" },
};

export default function TexasWorkPage() {
  return <WorkPage location="texas" />;
}
