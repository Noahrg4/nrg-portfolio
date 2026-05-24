import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ContactForm from "@/app/contact/ContactForm";
import { locationContent, type LocationSlug } from "@/lib/locationContent";

type Props = { location?: LocationSlug };

export function ContactPage({ location = "root" }: Props) {
  const content = locationContent[location];
  const linkPrefix = location === "root" ? "" : `/${location}`;

  return (
    <>
      <Nav logoHref={content.navLogoHref} linkPrefix={linkPrefix} />
      <main className="page-top">
        <section>
          <div className="container-content flex flex-col gap-6">
            <span className="font-mono text-[11px] uppercase tracking-wider text-accent">
              ▸ Get in touch
            </span>
            <h1 className="text-display text-[clamp(2.75rem,8vw,4.5rem)]">
              Let&apos;s talk about
              <br />
              your project.
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-ink-secondary md:text-lg">
              Tell me what you need. I&apos;ll tell you what it costs and how long it takes. No pressure.
            </p>
          </div>
        </section>

        <section className="section-pad">
          <div className="container-content grid grid-cols-1 gap-12 md:grid-cols-[1.5fr_1fr] md:gap-16">
            {/* Form */}
            <div className="flex flex-col gap-6">
              <p className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle">
                ▸ Project inquiry
              </p>
              <ContactForm />
            </div>

            {/* Sidebar */}
            <aside className="flex flex-col gap-6 rounded-xl border border-hairline bg-surface-1 p-5 md:gap-8 md:p-8">
              <div className="flex flex-col gap-3">
                <p className="text-sm leading-relaxed text-ink-secondary">
                  {content.contactSidebarBlurb}
                </p>
              </div>

              <div className="flex flex-col gap-4 border-t border-hairline pt-6">
                <p className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle">
                  Direct
                </p>
                <a
                  href="mailto:noah@nrgbuilds.com"
                  className="group flex flex-col gap-1"
                >
                  <span className="font-mono text-[11px] uppercase tracking-wider text-ink-secondary">
                    Email
                  </span>
                  <span className="text-base text-ink transition-colors group-hover:text-accent">
                    noah@nrgbuilds.com
                  </span>
                </a>
                <a
                  href="tel:+17135550000"
                  className="group flex flex-col gap-1"
                >
                  <span className="font-mono text-[11px] uppercase tracking-wider text-ink-secondary">
                    Phone
                  </span>
                  <span className="text-base text-ink transition-colors group-hover:text-accent">
                    (713) 555-0000
                  </span>
                </a>
              </div>

              <div className="flex flex-col gap-4 border-t border-hairline pt-6">
                <p className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle">
                  Based in
                </p>
                <p className="text-base text-ink">{content.contactBasedIn}</p>
                <p className="text-sm text-ink-secondary">
                  {content.contactServiceArea}
                </p>
              </div>

              <div className="flex flex-col gap-4 border-t border-hairline pt-6">
                <p className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle">
                  Response time
                </p>
                <p className="text-base text-ink">
                  Within 1 business day — usually same day.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer logoHref={content.navLogoHref} footerLocation={content.footerLocation} />
    </>
  );
}
