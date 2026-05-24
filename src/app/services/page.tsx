import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FloatingCta from "@/components/FloatingCta";
import SectionHeading from "@/components/SectionHeading";
import { services } from "@/lib/services";

export const metadata: Metadata = {
  title: "Services & Pricing — NRG Houston Web Design",
  description:
    "Web design, automation, local SEO, and hosting for Houston small businesses. Flat pricing, no monthly retainer required.",
};

export default function ServicesPage() {
  return (
    <>
      <Nav />
      <main className="pt-24 md:pt-40">
        <section>
          <div className="container-content flex flex-col gap-6">
            <h1 className="text-display text-[clamp(2rem,8vw,4.5rem)]">
              Simple, transparent
              <br />
              services.
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-ink-secondary md:text-lg">
              No jargon. No surprises. Just what your business needs to get online and start getting customers.
            </p>
          </div>
        </section>

        <section className="section-pad">
          <div className="container-content grid grid-cols-1 gap-6 md:grid-cols-2">
            {services.map((s) => (
              <article
                key={s.slug}
                className="group relative flex flex-col gap-6 rounded-xl border border-accent/20 bg-surface-2 p-8 transition-colors hover:border-accent md:p-10"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="text-accent">{s.icon}</span>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle">
                    Starting from{" "}
                    <span className="text-ink-secondary">{s.startingFrom}</span>
                  </span>
                </div>
                <h2 className="font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
                  {s.name}
                </h2>
                <p className="text-base leading-relaxed text-ink-secondary">
                  {s.long}
                </p>
                <ul className="flex flex-col gap-2.5 border-t border-hairline pt-5">
                  {s.includes.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-ink-secondary"
                    >
                      <span
                        className="mt-1.5 inline-block h-1 w-1 flex-shrink-0 rounded-full bg-accent"
                        aria-hidden
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex items-center justify-between border-t border-hairline pt-5">
                  <Link
                    href="/contact"
                    className="font-mono text-xs uppercase tracking-wider text-accent transition-opacity hover:opacity-80"
                  >
                    Discuss this →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-hairline">
          <div className="container-content grid grid-cols-1 items-start gap-10 py-section md:grid-cols-2">
            <SectionHeading className="text-display text-3xl md:text-5xl">
              Straight answers
              <br />
              on cost.
            </SectionHeading>
            <p className="text-base leading-relaxed text-ink-secondary md:text-lg">
              Every project is different. These are starting points. Most complete websites are $500–$800. Automation setups typically add $200–$500. Reach out and I&apos;ll give you a straight answer on what your project actually costs.
            </p>
          </div>
        </section>

        <section className="relative overflow-hidden border-t border-hairline">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              background:
                "radial-gradient(ellipse at 50% 100%, rgba(0,212,255,0.16), transparent 60%)",
            }}
          />
          <div className="container-content relative flex flex-col items-center gap-6 py-section-lg text-center">
            <SectionHeading className="text-display text-4xl md:text-6xl">
              Ready to get
              <br />
              started?
            </SectionHeading>
            <p className="max-w-2xl text-base text-ink-secondary md:text-lg">
              Most projects are live in 2–3 weeks. Let&apos;s talk about yours.
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
