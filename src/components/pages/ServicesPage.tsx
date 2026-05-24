import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FloatingCta from "@/components/FloatingCta";
import SectionHeading from "@/components/SectionHeading";
import ServiceDetailCard from "@/components/ServiceDetailCard";
import { services } from "@/lib/services";
import { locationContent, type LocationSlug } from "@/lib/locationContent";

type Props = { location?: LocationSlug };

export function ServicesPage({ location = "root" }: Props) {
  const content = locationContent[location];
  const linkPrefix = location === "root" ? "" : `/${location}`;

  return (
    <>
      <Nav logoHref={content.navLogoHref} linkPrefix={linkPrefix} />
      <main className="page-top">
        <section>
          <div className="container-content flex flex-col gap-6">
            <h1 className="text-display text-[clamp(2.75rem,8vw,4.5rem)]">
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
            {services.map((s, i) => (
              <ServiceDetailCard
                key={s.slug}
                icon={s.icon}
                name={s.name}
                long={s.long}
                startingFrom={s.startingFrom}
                includes={s.includes}
                delay={i * 0.08}
                linkPrefix={linkPrefix}
              />
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
              href={`${linkPrefix}/contact`}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-6 py-4 font-mono text-sm font-medium uppercase tracking-wider text-canvas transition-shadow duration-200 hover:shadow-[0_0_40px_rgba(0,212,255,0.5)] active:scale-[0.98] max-md:min-h-[56px] sm:w-auto sm:inline-flex"
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
