import { IconWeb, IconAutomation, IconSeo, IconSecurity } from "@/components/Icons";
import type { ReactNode } from "react";

export type Service = {
  slug: string;
  icon: ReactNode;
  name: string;
  short: string;
  long: string;
  startingFrom: string;
  includes: string[];
};

export const services: Service[] = [
  {
    slug: "web-design",
    icon: <IconWeb />,
    name: "Website Design",
    short:
      "A professional website that looks great on every screen and shows up on Google.",
    long: "You get a professional website built for your business, not a template from a library. It loads fast, works perfectly on phones, and you can make basic updates yourself — or I'll handle it as part of your support plan.",
    startingFrom: "$300",
    includes: [
      "Custom design",
      "Mobile-first",
      "Contact form",
      "Basic SEO",
    ],
  },
  {
    slug: "automation",
    icon: <IconAutomation />,
    name: "Automation Setup",
    short:
      "Contact forms that text you instantly. Review requests that go out automatically. Zero extra work.",
    long: "When a customer fills out your contact form, you get a text. When a job is done, your customer gets a review request. Set up once, runs in the background forever. Your business stays responsive without you lifting a finger.",
    startingFrom: "$300",
    includes: [
      "Form to SMS alerts",
      "Booking confirmations",
      "Review requests",
      "Follow-up emails",
    ],
  },
  {
    slug: "local-seo",
    icon: <IconSeo />,
    name: "Google & Local SEO",
    short:
      "Show up when local customers search for what you do.",
    long: "You show up when someone nearby searches for what you do. Your Google Business Profile gets set up and optimized. I take care of the technical work that makes Google trust your site.",
    startingFrom: "$50",
    includes: [
      "Google Business Profile",
      "Local rankings",
      "Citations",
      "Map visibility",
    ],
  },
  {
    slug: "security-hosting",
    icon: <IconSecurity />,
    name: "Monthly Support",
    short:
      "Updates, changes, and security patches. When something looks off, you've got someone to call.",
    long: "A developer in your corner every month. Updates, changes, security patches, and priority response when something needs attention.",
    startingFrom: "$20/month",
    includes: [
      "Monthly updates",
      "Uptime monitoring",
      "Security",
      "Priority response",
    ],
  },
];
