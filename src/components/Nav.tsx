"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { href: "/work",     label: "Work"     },
  { href: "/about",   label: "About"    },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact"  },
];

type NavProps = {
  logoHref?: string
}

export default function Nav({ logoHref = "/" }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when overlay is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-200 ${
        scrolled
          ? "border-b border-hairline bg-canvas/70 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="container-content flex h-16 items-center justify-between gap-6">
        {/* Wordmark */}
        <Link
          href={logoHref}
          className="font-display text-2xl font-extrabold tracking-tight text-ink"
          aria-label="NRG home"
        >
          NRG
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-mono text-[13px] uppercase tracking-wider text-ink-secondary transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/contact"
            className="rounded-md bg-accent px-4 py-2 font-mono text-[12px] font-medium uppercase tracking-wider text-canvas transition-shadow duration-200 hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] active:opacity-90"
          >
            Get in touch
          </Link>
        </div>

        {/* Hamburger — mobile only */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`block h-px w-6 bg-ink transition-transform duration-200 ${
              open ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-px w-6 bg-ink transition-opacity duration-200 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`block h-px w-6 bg-ink transition-transform duration-200 ${
              open ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ opacity: 0, transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] } }}
            className="fixed inset-0 top-16 z-40 flex flex-col border-t border-hairline bg-canvas/95 px-6 py-10 backdrop-blur-xl md:hidden"
          >
            {/* Nav links — each 60px tall minimum for thumb-friendly tapping */}
            <nav className="flex flex-col" aria-label="Mobile">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[60px] items-center font-display text-[2rem] font-extrabold tracking-tight text-ink"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Bottom CTA */}
            <div className="mt-auto">
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="font-mono text-sm uppercase tracking-wider text-accent"
              >
                Start a project →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
