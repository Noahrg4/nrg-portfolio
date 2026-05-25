import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FloatingCta from "@/components/FloatingCta";
import SectionHeading from "@/components/SectionHeading";
import AboutSkillCard from "@/components/AboutSkillCard";
import {
  IconWeb,
  IconAutomation,
  IconSeo,
  IconSecurity,
} from "@/components/Icons";
import { locationContent, type LocationSlug } from "@/lib/locationContent";

type Props = { location?: LocationSlug };

export function AboutPage({ location = "root" }: Props) {
  const content = locationContent[location];
  const linkPrefix = location === "root" ? "" : `/${location}`;

  const skills = [
    {
      icon: <IconWeb />,
      title: "Web Design",
      body: "Custom websites, mobile-first, fast loading, easy to update. Built to look professional and rank on Google.",
    },
    {
      icon: <IconAutomation />,
      title: "Automation",
      body: "Contact alerts, booking confirmations, review requests, follow-up emails. Set up once, runs forever.",
    },
    {
      icon: <IconSeo />,
      title: "Local SEO",
      body: content.aboutSeoSkillBody,
    },
    {
      icon: <IconSecurity />,
      title: "Security & Hosting",
      body: "SSL, secure servers, regular backups. Your site and customer data are protected.",
    },
  ];

  return (
    <>
      <Nav logoHref={content.navLogoHref} linkPrefix={linkPrefix} />
      <main className="page-top">
        <section>
          <div className="container-content flex flex-col gap-6">
            <h1 className="text-display text-[clamp(2.75rem,8vw,4.5rem)]">
              {content.aboutPageHeadline}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-ink-secondary md:text-lg">
              Websites that show up on Google and actually bring in customers.
            </p>
          </div>
        </section>

        <section className="section-pad">
          <div className="container-content grid grid-cols-1 items-start gap-12 md:grid-cols-[1.2fr_1fr] md:gap-16">
            <div className="flex flex-col gap-6">
              <SectionHeading className="text-display text-3xl md:text-4xl">
                Direct work. No agency
                <br />
                in the middle.
              </SectionHeading>
              <div className="flex flex-col gap-5 text-base leading-relaxed text-ink-secondary md:text-lg">
                <p>{content.aboutBioParagraph1}</p>
                <p>Before starting NRG, I spent two years building and running technology systems inside a Fortune 100 company — whether it&apos;s a $100 site for a local plumber or a full automation setup for a growing service business, that standard comes with me.</p>
                <p>I have a degree in Computer Science and Cybersecurity, so your website and your customers&apos; information are in careful hands.</p>
                <p>{content.aboutBioClosingLine}</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  content.aboutLocationBadge,
                  "Solo",
                  "Small businesses, real results",
                ].map((p) => (
                  <span
                    key={p}
                    className="rounded-full border border-hairline bg-surface-2 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-secondary"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative hidden aspect-[4/5] overflow-hidden rounded-xl border border-hairline bg-surface-1 md:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/noah-headshot.jpg"
                alt={content.aboutHeadshotAlt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-top"
              />
            </div>
          </div>
        </section>

        <section className="section-pad border-t border-hairline">
          <div className="container-content">
            <div className="mb-12 flex flex-col gap-4">
              <SectionHeading className="text-display text-4xl md:text-5xl">
                What I bring to
                <br />
                every project.
              </SectionHeading>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {skills.map((s, i) => (
                <AboutSkillCard
                  key={s.title}
                  icon={s.icon}
                  title={s.title}
                  body={s.body}
                  delay={i * 0.08}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-hairline">
          <div className="container-content py-section">
            <p className="text-base text-ink-secondary md:text-lg">
              CompTIA Security+, A+, Network+ certified. Your business is in safe hands.
            </p>
          </div>
        </section>

        <section className="border-t border-hairline">
          <div className="container-content flex flex-col items-start gap-6 py-section">
            <SectionHeading className="text-display max-w-3xl text-3xl md:text-5xl">
              Ready to talk about
              <br />
              your business?
            </SectionHeading>
            <Link
              href={`${linkPrefix}/contact`}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-6 py-4 font-mono text-sm font-medium uppercase tracking-wider text-canvas transition-shadow duration-200 hover:shadow-[0_0_40px_rgba(0,212,255,0.5)] active:scale-[0.98] max-md:min-h-[56px] sm:w-auto sm:inline-flex"
            >
              Get in touch
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      </main>
      <Footer logoHref={content.navLogoHref} footerLocation={content.footerLocation} />
      <FloatingCta linkPrefix={linkPrefix} />
    </>
  );
}
