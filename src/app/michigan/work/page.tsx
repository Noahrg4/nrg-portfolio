import type { Metadata } from "next";
import { WorkPage } from "@/components/pages/WorkPage";

export const metadata: Metadata = {
  title: "Work — NRG Michigan",
  description: "Web design projects for Michigan businesses.",
  alternates: { canonical: "https://nrgbuilds.com/michigan/work" },
};

export default function MichiganWorkPage() {
  return <WorkPage location="michigan" />;
}
