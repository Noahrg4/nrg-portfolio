import Link from "next/link";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FloatingCta from "@/components/FloatingCta";
import SectionHeading from "@/components/SectionHeading";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Work — Houston Small Business Websites by NRG",
  description:
    "Selected websites built for Houston restaurants, home services, and salon owners. Real businesses, real outcomes.",
};

export default function WorkPage() {
  return (
    <>
      <Nav />
      <main className="pt-24 md:pt-40">
        {/* Page header */}
        <section>
          <div className="container-content flex flex-col gap-6">
            <h1 className="text-display text-[clamp(2rem,8vw,4.5rem)]">
              Work
            </h1>
          </div>
        </section>

        {/* Grid section — tight 16px gap, no section-pad (avoids huge void) */}
        <section style={{ paddingTop: "clamp(2rem, 5vw, 3rem)", paddingBottom: "clamp(2rem, 5vw, 3rem)" }}>
          <div className="container-content">
            {/* "Selected work" label above grid */}
            <p className="mb-5 font-mono text-[12px] uppercase tracking-[0.1em] text-white/40">
              Selected work
            </p>

            {/* 2-column grid, 16px gap */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {projects.map((p, i) => (
                <ProjectCard
                  key={p.slug}
                  category={p.category}
                  title={p.title}
                  url={p.url}
                  gradient={p.gradient}
                  imageSrc={p.imageSrc}
                  imageAlt={p.imageAlt}
                  liveUrl={p.liveUrl}
                  delay={i * 0.08}
                />
              ))}
            </div>

            {/* Mono caption below grid */}
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
              href="/contact"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3.5 font-mono text-sm font-medium uppercase tracking-wider text-canvas transition-shadow hover:shadow-[0_0_40px_rgba(0,212,255,0.5)]"
            >
              Start a project
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingCta />
    </>
  );
}
