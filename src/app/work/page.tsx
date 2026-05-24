import type { Metadata } from "next";
import { WorkPage } from "@/components/pages/WorkPage";

export const metadata: Metadata = {
  title: "Work — Small Business Websites by NRG",
  description:
    "Selected websites built for restaurants, home services, and salon owners. Real businesses, real outcomes.",
};

export default function Page() {
  return <WorkPage />;
}
