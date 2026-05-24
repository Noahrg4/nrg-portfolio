"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

// ── Easing ────────────────────────────────────────────────────────────────────
const EASE_IN  = "cubic-bezier(0.16, 1, 0.3, 1)";
const EASE_OUT = "cubic-bezier(0.4, 0, 1, 1)";

// ── Phase 1 timing (ms) ───────────────────────────────────────────────────────
const P1_DELAY       = 500;
const P1_IN_DUR      = 300;
const P1_TEXT_IN_AT  = 90;
const P1_HOLD        = 400;
const P1_OUT_DUR     = 220;
const P1_TEXT_OUT_AT = 50;
const P1_GAP         = 60;

// ── Phase 2 timing (ms) ───────────────────────────────────────────────────────
const P2_IN_DUR      = 180;
const P2_TEXT_IN_AT  = 55;
const P2_OUT_DUR     = 150;
const P2_TEXT_OUT_AT = 40;

// ── Types ─────────────────────────────────────────────────────────────────────
export type HLLine = { text: string; accent?: boolean };
type Props = { lines?: HLLine[]; className?: string };

// ── Component ─────────────────────────────────────────────────────────────────
export default function HeroHeadline({ lines = [], className = "" }: Props) {
  // Three highlight bars + text wrappers
  const bg0  = useRef<HTMLDivElement>(null);
  const bg1  = useRef<HTMLDivElement>(null);
  const bg2  = useRef<HTMLDivElement>(null);
  const txt0 = useRef<HTMLSpanElement>(null);
  const txt1 = useRef<HTMLSpanElement>(null);
  const txt2 = useRef<HTMLSpanElement>(null);

  // Separate timer buckets so hover can't stomp Phase 1
  const p1Ids = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hIds0 = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hIds1 = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hIds2 = useRef<ReturnType<typeof setTimeout>[]>([]);

  const hovered = useRef([false, false, false]);
  const p2Ready = useRef(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const bgs  = [bg0.current,  bg1.current,  bg2.current ] as const;
    const txts = [txt0.current, txt1.current, txt2.current] as const;
    const hIds = [hIds0,        hIds1,        hIds2       ] as const;

    // ── helpers ───────────────────────────────────────────────────────────────

    function p1Push(fn: () => void, delay: number) {
      p1Ids.current.push(setTimeout(fn, delay));
    }

    /** Flip text color instantly — never a CSS transition. */
    function setColor(idx: 0 | 1 | 2, black: boolean) {
      const el = txts[idx];
      if (!el) return;
      el.style.color = black ? "#000" : "";
      el.style.setProperty("-webkit-text-fill-color", black ? "#000" : "");
    }

    /** Drive the highlight bar. */
    function sweep(
      idx: 0 | 1 | 2,
      to: 0 | 1,
      origin: "left" | "right",
      dur: number,
      ease: string
    ) {
      const bg = bgs[idx];
      if (!bg) return;
      bg.style.transformOrigin = `${origin} center`;
      bg.style.transition = dur === 0 ? "none" : `transform ${dur}ms ${ease}`;
      if (dur === 0) void bg.offsetHeight; // force reflow on instant resets
      bg.style.transform = `scaleX(${to})`;
    }

    // ── Phase 1 auto-sequence (3 lines) ──────────────────────────────────────

    if (!reduced) {
      let t = P1_DELAY;

      // Line 0
      p1Push(() => sweep(0, 1, "left",  P1_IN_DUR,  EASE_IN ), t);
      p1Push(() => setColor(0, true),                           t + P1_TEXT_IN_AT);
      t += P1_IN_DUR + P1_HOLD;
      p1Push(() => sweep(0, 0, "right", P1_OUT_DUR, EASE_OUT), t);
      p1Push(() => setColor(0, false),                          t + P1_TEXT_OUT_AT);
      t += P1_OUT_DUR + P1_GAP;

      // Line 1
      p1Push(() => sweep(1, 1, "left",  P1_IN_DUR,  EASE_IN ), t);
      p1Push(() => setColor(1, true),                           t + P1_TEXT_IN_AT);
      t += P1_IN_DUR + P1_HOLD;
      p1Push(() => sweep(1, 0, "right", P1_OUT_DUR, EASE_OUT), t);
      p1Push(() => setColor(1, false),                          t + P1_TEXT_OUT_AT);
      t += P1_OUT_DUR + P1_GAP;

      // Line 2
      p1Push(() => sweep(2, 1, "left",  P1_IN_DUR,  EASE_IN ), t);
      p1Push(() => setColor(2, true),                           t + P1_TEXT_IN_AT);
      t += P1_IN_DUR + P1_HOLD;
      p1Push(() => sweep(2, 0, "right", P1_OUT_DUR, EASE_OUT), t);
      p1Push(() => setColor(2, false),                          t + P1_TEXT_OUT_AT);
      t += P1_OUT_DUR;

      // Phase 2 unlocks when sequence finishes
      p1Push(() => { p2Ready.current = true; }, t);

    } else {
      p2Ready.current = true;
    }

    // ── Phase 2 hover ─────────────────────────────────────────────────────────

    const cleanups: (() => void)[] = [];

    (([0, 1, 2] as const)).forEach((i) => {
      const hTimer = hIds[i];

      function clearH() {
        hTimer.current.forEach(clearTimeout);
        hTimer.current = [];
      }
      function hPush(fn: () => void, delay: number) {
        hTimer.current.push(setTimeout(fn, delay));
      }

      function onEnter() {
        if (!p2Ready.current) return;
        hovered.current[i] = true;
        clearH();

        if (reduced) {
          sweep(i, 1, "left", 0, EASE_IN);
          setColor(i, true);
          return;
        }

        sweep(i, 1, "left", P2_IN_DUR, EASE_IN);
        hPush(() => { if (hovered.current[i]) setColor(i, true); }, P2_TEXT_IN_AT);
      }

      function onLeave() {
        if (!p2Ready.current) return;
        hovered.current[i] = false;
        clearH();

        if (reduced) {
          sweep(i, 0, "right", 0, EASE_OUT);
          setColor(i, false);
          return;
        }

        sweep(i, 0, "right", P2_OUT_DUR, EASE_OUT);
        hPush(() => { if (!hovered.current[i]) setColor(i, false); }, P2_TEXT_OUT_AT);
      }

      const container = bgs[i]?.parentElement;
      if (container) {
        container.addEventListener("mouseenter", onEnter);
        container.addEventListener("mouseleave", onLeave);
        cleanups.push(() => {
          container.removeEventListener("mouseenter", onEnter);
          container.removeEventListener("mouseleave", onLeave);
        });
      }
    });

    // Snapshot refs for stable cleanup closure
    const p1Snap = p1Ids.current;
    const h0Snap = hIds0.current;
    const h1Snap = hIds1.current;
    const h2Snap = hIds2.current;
    return () => {
      p1Snap.forEach(clearTimeout);
      h0Snap.forEach(clearTimeout);
      h1Snap.forEach(clearTimeout);
      h2Snap.forEach(clearTimeout);
      cleanups.forEach((c) => c());
    };
  }, []);

  const text0 = lines[0]?.text ?? "";
  const text1 = lines[1]?.text ?? "";
  const text2 = lines[2]?.text ?? "";

  const bgStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    background: "var(--accent)",
    transform: "scaleX(0)",
    transformOrigin: "left center",
    willChange: "transform",
    zIndex: 1,
  };

  const txtStyle: React.CSSProperties = {
    position: "relative",
    display: "block",
    zIndex: 2,
    paddingBottom: "0.15em",
    marginBottom: "-0.15em",
  };

  return (
    <h1
      className={`text-display text-[clamp(1.75rem,8vw,9rem)] ${className}`}
      aria-label={[text0, text1, text2].filter(Boolean).join(" ")}
    >
      <span className="relative block overflow-hidden" style={{ cursor: "default" }}>
        <div ref={bg0} aria-hidden style={bgStyle} />
        <span ref={txt0} style={txtStyle}>{text0}</span>
      </span>

      <span className="relative block overflow-hidden" style={{ cursor: "default" }}>
        <div ref={bg1} aria-hidden style={bgStyle} />
        <span ref={txt1} style={txtStyle}>{text1}</span>
      </span>

      <span className="relative block overflow-hidden" style={{ cursor: "default" }}>
        <div ref={bg2} aria-hidden style={bgStyle} />
        <span ref={txt2} style={txtStyle}>{text2}</span>
      </span>
    </h1>
  );
}

// ── HeadlinePlaceholder (unchanged) ───────────────────────────────────────────
export function HeadlinePlaceholder({ children }: { children: ReactNode }) {
  return (
    <span className="block font-mono text-xs uppercase tracking-wider text-ink-subtle">
      {children}
    </span>
  );
}
