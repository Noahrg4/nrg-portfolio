"use client";

/**
 * src/components/admin/LoginForm.tsx
 *
 * Login form — username + password, posts to /api/admin/auth/login.
 * Shows inline error on 401. Redirects to /admin on success.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full rounded-md border border-hairline bg-surface-2 px-4 py-3.5 text-base text-ink placeholder:text-ink-subtle transition-colors focus:border-accent focus:outline-none";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Both fields are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
        return;
      }

      if (res.status === 401) {
        setError("Invalid username or password.");
      } else if (res.status === 503) {
        setError("Admin panel is not configured. Contact the site owner.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-xl border border-hairline bg-surface-1 p-8"
        noValidate
      >
        <div className="flex flex-col gap-2">
          <label
            htmlFor="username"
            className="font-mono text-[11px] uppercase tracking-wider text-ink-secondary"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            name="username"
            autoComplete="username"
            autoFocus
            placeholder="admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            className={inputClass}
            aria-describedby={error ? "login-error" : undefined}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="font-mono text-[11px] uppercase tracking-wider text-ink-secondary"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className={inputClass}
          />
        </div>

        {error && (
          <p
            id="login-error"
            role="alert"
            className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 font-mono text-sm text-red-300"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-md bg-accent px-6 py-3.5 font-mono text-sm uppercase tracking-wider text-canvas transition-shadow hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? (
            <>
              <span
                aria-hidden
                className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-canvas border-r-transparent"
              />
              Signing in…
            </>
          ) : (
            "Sign in →"
          )}
        </button>
      </form>
    </motion.div>
  );
}
