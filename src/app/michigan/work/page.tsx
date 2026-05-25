import type { Metadata } from "next";
import { WorkPage } from "@/components/pages/WorkPage";

export const metadata: Metadata = {
  title: "Work — NRG Michigan",
  description: "Portfolio of websites built for Michigan small businesses — restaurants, trades, law offices, and more. Built by someone from here.",
  alternates: { canonical: "https://nrgwebsites.com/michigan/work" },
};

export default function MichiganWorkPage() {
  return <WorkPage location="michigan" />;
}
