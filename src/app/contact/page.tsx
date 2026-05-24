import type { Metadata } from "next";
import { ContactPage } from "@/components/pages/ContactPage";

export const metadata: Metadata = {
  title: "Contact — NRG Web Design & Automation",
  description:
    "Start a project, or just see if NRG is the right fit. Direct response — usually within one business day.",
};

export default function Page() {
  return <ContactPage />;
}
