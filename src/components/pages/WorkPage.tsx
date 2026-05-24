import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FloatingCta from "@/components/FloatingCta";
import SectionHeading from "@/components/SectionHeading";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/lib/projects";
import { locationContent, type LocationSlug } from "@/lib/locationContent";

const slugToCardKey = {
  "gushow-excavating": "gushow",
  "rewilding-life": "rewilding",
  "houston-restaurant": "rusticTable",
  "houston-hvac": "martinezHvac",
  "houston-law": "reyesLaw",
} as const;

type CardKey = keyof typeof slugToCardKey;

type Props = { location?: LocationSlug };

export function WorkPage({ location = "root" }: Props) {
  const content = locationContent[location];
  const linkPrefix = location === "root" ? "" : `/${location}`;

  return (
    <>
      <Nav logoHref={content.navLogoHref} linkPrefix={linkPrefix} />
      <main className="page-top">
        {/* Page header */}
        <section>
          <div className="container-content flex flex-col gap-6">
            <h1 className="text-display text-[clamp(2.75rem,8vw,4.5rem)]">
              Work
            </h1>
          </div>
        </section>

        {/* Grid section */}
        <section style={{ paddingTop: "clamp(2rem, 5vw, 3rem)", paddingBottom: "clamp(2rem, 5vw, 3rem)" }}>
          <div className="container-content">
            <p className="mb-5 font-mono text-[12px] uppercase tracking-[0.1em] text-white/40">
              Selected work
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {projects.map((p, i) => {
                const cardKey = slugToCardKey[p.slug as CardKey];
                const title = cardKey ? content.cardTitles[cardKey] : p.title;
                return (
                  <ProjectCard
                    key={p.slug}
                    category={p.category}
                    title={title}
                    url={p.url}
                    gradient={p.gradient}
                    imageSrc={p.imageSrc}
                    imageAlt={p.imageAlt}
                    liveUrl={p.liveUrl}
                    delay={i * 0.08}
                  />
                );
              })}
            </div>

            <p
              className="mt-16 font-mono text-[13px] text-center tracking-[0.05em]"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              More work available on request.
            </p>
          </div>
        </section>

        {/* CTA section */}
        <section className="border-t border-hairline">
          <div className="container-content flex flex-col items-start gap-6 py-section">
            <SectionHeading className="text-display max-w-3xl text-3xl md:text-5xl">
              More work available
              <br />
              on request.
            </SectionHeading>
            <p className="max-w-xl text-base text-ink-secondary">
              Reach out to see projects in your industry.
            </p>
            <Link
              href={`${linkPrefix}/contact`}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-6 py-4 font-mono text-sm font-medium uppercase tracking-wider text-canvas transition-shadow hover:shadow-[0_0_40px_rgba(0,212,255,0.5)] max-md:min-h-[56px] sm:w-auto sm:inline-flex"
            >
              Start a project
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      </main>
      <Footer logoHref={content.navLogoHref} />
      <FloatingCta linkPrefix={linkPrefix} />
    </>
  );
}
