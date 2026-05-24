import Link from "next/link";

type FooterProps = {
  logoHref?: string;
};

export default function Footer({ logoHref = "/" }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-hairline">
      <div className="container-content py-8">

        {/* ── Mobile: two centered lines ─────────────────────────────────── */}
        <div className="flex flex-col items-center gap-2 text-center md:hidden">
          <Link
            href={logoHref}
            className="font-display text-xl font-extrabold tracking-tight text-ink"
            aria-label="NRG home"
          >
            NRG
          </Link>
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-secondary">
            Houston, TX &nbsp;·&nbsp; © {year} &nbsp;·&nbsp;{" "}
            <a
              href="mailto:noah@nrgbuilds.com"
              className="transition-colors hover:text-ink"
            >
              noah@nrgbuilds.com
            </a>
          </p>
        </div>

        {/* ── Desktop: horizontal row ────────────────────────────────────── */}
        <div className="hidden items-center justify-between md:flex">
          <Link
            href={logoHref}
            className="font-display text-xl font-extrabold tracking-tight text-ink"
            aria-label="NRG home"
          >
            NRG
          </Link>
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-secondary">
            Houston, TX
          </span>
          <a
            href="mailto:noah@nrgbuilds.com"
            className="font-mono text-[11px] uppercase tracking-wider text-ink-secondary transition-colors hover:text-ink"
          >
            noah@nrgbuilds.com
          </a>
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-secondary">
            © {year}
          </span>
        </div>

      </div>
    </footer>
  );
}
