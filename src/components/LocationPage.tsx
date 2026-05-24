import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FloatingCta from "@/components/FloatingCta";
import HeroHeadline from "@/components/HeroHeadline";
import HomepageProjectCard from "@/components/HomepageProjectCard";
import ServiceCard from "@/components/ServiceCard";
import TestimonialCard from "@/components/TestimonialCard";
import SectionHeading from "@/components/SectionHeading";
import { projects } from "@/lib/projects";
import { services } from "@/lib/services";
import { featuredTestimonial, testimonials } from "@/lib/testimonials";
import { locationContent, type LocationSlug } from "@/lib/locationContent";

type Props = {
  location: LocationSlug
}

const slugToCardKey: Record<string, keyof typeof locationContent.root.cardTitles> = {
  "gushow-excavating": "gushow",
  "rewilding-life": "rewilding",
  "houston-restaurant": "rusticTable",
  "houston-hvac": "martinezHvac",
  "houston-law": "reyesLaw",
}

export function LocationPage({ location }: Props) {
  const content = locationContent[location]
  const linkPrefix = location === "root" ? "" : `/${location}`

  return (
    <>
      <Nav logoHref={content.navLogoHref} linkPrefix={linkPrefix} />
      <main className="pt-16" style={{ overflowX: "clip" }}>
        {/* HERO */}
        <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-visible">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full opacity-40 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(0,212,255,0.18), transparent 70%)",
            }}
          />
          <div className="container-content relative flex flex-col gap-6 py-section text-left md:gap-10">
            <HeroHeadline
              lines={[
                { text: "Real Clients." },
                { text: "Real Websites." },
                { text: "Real Results." },
              ]}
            />

            {/* Location line — only when not null */}
            {content.heroLocationLine !== null && (
              <p className="max-w-2xl font-display text-xl font-bold tracking-tight text-accent md:text-3xl">
                {content.heroLocationLine}
              </p>
            )}

            {/* Description */}
            <p className="max-w-2xl text-base leading-relaxed text-ink-secondary md:text-lg">
              {content.heroSub}
            </p>

            {/* CTAs: full-width stack on mobile, row on desktop */}
            <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-4">
              <Link
                href={`${linkPrefix}/contact`}
                className="flex items-center justify-center gap-2 rounded-md bg-accent px-6 py-4 font-mono text-sm font-medium uppercase tracking-wider text-canvas transition-shadow duration-200 hover:shadow-[0_0_40px_rgba(0,212,255,0.5)] active:scale-[0.98]"
              >
                Start a project
                <span aria-hidden>→</span>
              </Link>
              {/* Ghost CTA — desktop only */}
              <Link
                href={`${linkPrefix}/work`}
                className="hidden items-center gap-2 rounded-md border border-hairline-strong px-6 py-3.5 font-mono text-sm font-medium uppercase tracking-wider text-ink transition-colors duration-200 hover:border-accent hover:text-accent md:inline-flex"
              >
                See my work
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURED TESTIMONIAL */}
        <section className="section-pad border-t border-hairline">
          <div className="container-content">
            <div className="mb-12 flex items-center gap-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-accent">
                ▸ In their words
              </span>
              <span className="h-px flex-1 bg-hairline" aria-hidden />
            </div>
            <div className="mx-auto max-w-4xl">
              <TestimonialCard
                quote={featuredTestimonial.quote}
                author={featuredTestimonial.author}
                business={featuredTestimonial.business}
                featured
              />
            </div>
          </div>
        </section>

        {/* WORK PREVIEW */}
        <section id="work" className="section-pad border-t border-hairline">
          <div className="container-content">
            <div className="mb-12 flex flex-col gap-4">
              <SectionHeading className="text-display text-4xl md:text-6xl">
                Websites built
                <br />
                for real Houston
                <br />
                businesses.
              </SectionHeading>
            </div>
            {/* Tight grid — 16px gap, image does the talking */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.slice(0, 3).map((p, i) => {
                const cardKey = slugToCardKey[p.slug]
                const title = cardKey ? content.cardTitles[cardKey] : p.title
                return (
                  <HomepageProjectCard
                    key={p.slug}
                    category={p.category}
                    title={title}
                    url={p.url}
                    gradient={p.gradient}
                    imageSrc={p.imageSrc}
                    imageAlt={p.imageAlt}
                    delay={i * 0.08}
                    linkPrefix={linkPrefix}
                  />
                )
              })}
            </div>
            {/* Right-aligned "All projects →" below the grid */}
            <div className="mt-6 flex justify-end">
              <Link
                href={`${linkPrefix}/work`}
                className="inline-flex min-h-[44px] items-center font-mono text-[13px] text-accent transition-opacity duration-200 hover:opacity-80"
              >
                All projects →
              </Link>
            </div>
          </div>
        </section>

        {/* SERVICES STRIP */}
        <section
          id="services"
          className="section-pad border-t border-hairline bg-surface-1/30"
        >
          <div className="container-content">
            <div className="mb-12 flex flex-col gap-4">
              <SectionHeading className="text-display text-4xl md:text-6xl">
                Everything your business
                <br />
                needs to get online.
              </SectionHeading>
              <p className="max-w-2xl text-base text-ink-secondary">
                Outcomes, not jargon. Pick one piece or the whole system —
                priced for small businesses, not agencies.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((s, i) => (
                <ServiceCard
                  key={s.slug}
                  icon={s.icon}
                  name={s.name}
                  description={s.short}
                  startingFrom={s.startingFrom}
                  delay={i * 0.08}
                />
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section className="section-pad border-t border-hairline">
          <div className="container-content">
            <div className="mb-12 flex flex-col gap-4">
              <SectionHeading className="text-display text-4xl md:text-6xl">
                Simple from
                <br />
                start to live.
              </SectionHeading>
            </div>
            <ol className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  title: "We talk.",
                  body: "Tell me about your business and what you need. No tech speak required.",
                },
                {
                  title: "I build it.",
                  body: "You see progress along the way. Nothing goes live until you're happy with it.",
                },
                {
                  title: "You get customers.",
                  body: "Your site goes live, your automations run, and you start showing up where your customers are looking.",
                },
              ].map((step, i) => (
                <li
                  key={i}
                  className="flex flex-col gap-5 rounded-lg border border-hairline bg-surface-1 p-8"
                >
                  <span className="font-display text-6xl font-extrabold text-accent">
                    0{i + 1}
                  </span>
                  <h3 className="font-display text-xl font-bold tracking-tight text-ink">
                    {step.title}
                  </h3>
                  <p className="text-base leading-relaxed text-ink-secondary">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* MORE TESTIMONIALS */}
        <section className="section-pad border-t border-hairline">
          <div className="container-content">
            <div className="mb-12 flex items-center gap-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-accent">
                ▸ More clients
              </span>
              <span className="h-px flex-1 bg-hairline" aria-hidden />
            </div>
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
              {testimonials.map((t, i) => (
                <TestimonialCard
                  key={i}
                  quote={t.quote}
                  author={t.author}
                  business={t.business}
                  delay={i * 0.08}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT TEASER */}
        <section className="section-pad border-t border-hairline">
          <div className="container-content grid grid-cols-1 items-start gap-12 md:grid-cols-2 md:gap-16">
            <div className="relative hidden aspect-square overflow-hidden rounded-xl border border-hairline bg-surface-1 md:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/noah-headshot.jpg"
                alt="Noah Reuter-Gushow — NRG web designer"
                className="h-full w-full object-cover object-top"
              />
            </div>
            <div className="flex flex-col gap-6">
              <SectionHeading className="text-display text-4xl md:text-5xl">
                Built for Houston.
                <br />
                By someone you can reach.
              </SectionHeading>
              <p className="text-base leading-relaxed text-ink-secondary md:text-lg">
                {content.aboutOpener}
              </p>
              <p className="text-base leading-relaxed text-ink-secondary md:text-lg">
                {content.aboutParagraph2}
              </p>
              <ul className="flex flex-wrap gap-2">
                {["Web", "Automation", "SEO", "Security"].map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-hairline bg-surface-2 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-secondary"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
              <div>
                <Link
                  href={`${linkPrefix}/about`}
                  className="inline-flex min-h-[44px] items-center gap-2 font-mono text-sm uppercase tracking-wider text-accent transition-opacity duration-200 hover:opacity-80"
                >
                  More about me →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA BAND */}
        <section className="relative overflow-hidden border-t border-hairline">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse at 50% 100%, rgba(0,212,255,0.18), transparent 60%)",
            }}
          />
          <div className="container-content relative flex flex-col items-center gap-8 py-section-lg text-center">
            <SectionHeading className="text-display text-5xl md:text-7xl">
              {content.ctaBandHeadline}
            </SectionHeading>
            <p className="max-w-2xl text-base leading-relaxed text-ink-secondary md:text-lg">
              {content.ctaBandSub}
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
              <Link
                href={`${linkPrefix}/contact`}
                className="flex items-center justify-center gap-2 rounded-md bg-accent px-6 py-4 font-mono text-sm font-medium uppercase tracking-wider text-canvas transition-shadow duration-200 hover:shadow-[0_0_40px_rgba(0,212,255,0.5)] active:scale-[0.98]"
              >
                Start a project
                <span aria-hidden>→</span>
              </Link>
              <a
                href="tel:+17135550000"
                className="flex items-center justify-center gap-2 rounded-md border border-hairline-strong px-6 py-4 font-mono text-sm font-medium uppercase tracking-wider text-ink transition-colors duration-200 hover:border-accent hover:text-accent"
              >
                Or call (713) 555-0000
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer logoHref={content.navLogoHref} />
      <FloatingCta linkPrefix={linkPrefix} />
    </>
  )
}
