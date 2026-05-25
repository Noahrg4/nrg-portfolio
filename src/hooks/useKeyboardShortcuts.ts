"use client";

/**
 * src/hooks/useKeyboardShortcuts.ts
 *
 * Global keyboard shortcut listener for the admin dashboard.
 * Register a map of key → handler and the hook wires up / tears down cleanly.
 *
 * ── Usage ────────────────────────────────────────────────────────────────────
 *
 *   useKeyboardShortcuts({
 *     n: () => dispatch('open-new-lead'),
 *     '?': () => setShortcutsOpen(true),
 *   });
 *
 * ── Rules ───────────────────────────────────────────────────────────────────
 * - Shortcuts are SKIPPED when focus is inside an <input>, <textarea>, or
 *   <select> — avoids stealing characters the user is typing.
 * - Modifiers: pass `meta` / `ctrl` / `shift` in the key string via convention
 *   handled inside handlers. For Cmd/Ctrl+S the shortcut key is "s" and
 *   handlers check `e.metaKey || e.ctrlKey` themselves (passed via onKey).
 * - The hook accepts an `enabled` flag (default true) to pause all handlers.
 *
 * ── Adding new shortcuts ─────────────────────────────────────────────────────
 * Pass a new key → handler pair in the `shortcuts` map. Handlers receive the
 * raw `KeyboardEvent` so they can inspect modifiers. Return value is ignored.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef } from "react";

type ShortcutHandler = (e: KeyboardEvent) => void;
type ShortcutMap = Record<string, ShortcutHandler>;

/** Elements that should swallow keyboard input — skip shortcuts inside them. */
const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function isTyping(): boolean {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return false;
  if (INPUT_TAGS.has(el.tagName)) return true;
  if (el.isContentEditable) return true;
  return false;
}

interface UseKeyboardShortcutsOptions {
  /** Whether shortcuts are active. Defaults to true. */
  enabled?: boolean;
}

export function useKeyboardShortcuts(
  shortcuts: ShortcutMap,
  { enabled = true }: UseKeyboardShortcutsOptions = {}
): void {
  // Keep a stable ref to the latest shortcuts map so we don't re-bind on
  // every render when consumers define the map inline.
  const shortcutsRef = useRef<ShortcutMap>(shortcuts);
  shortcutsRef.current = shortcuts;

  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!enabledRef.current) return;
      if (isTyping()) return;

      const handler = shortcutsRef.current[e.key];
      if (handler) {
        handler(e);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []); // mount/unmount only — shortcutsRef stays current via ref
}
