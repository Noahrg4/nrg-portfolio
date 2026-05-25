/**
 * src/app/admin/(auth)/login/page.tsx
 *
 * /admin/login — standalone login page, NOT wrapped by dashboard layout.
 * Full-page centered form, no sidebar, no tab bar.
 */

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Login — NRG",
  robots: "noindex,nofollow",
};

import LoginForm from "@/components/admin/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 py-12">
      {/* Radial glow orb — mirrors public site hero pattern */}
      <div
        aria-hidden
        className="pointer-events-none fixed -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(0,212,255,0.18), transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Wordmark */}
        <div className="mb-8 text-center">
          <span className="font-display text-2xl font-extrabold tracking-tight text-ink">
            NRG
          </span>
        </div>

        {/* Heading block */}
        <div className="mb-8 text-center">
          <h1 className="text-display text-3xl tracking-tight text-ink md:text-4xl">
            Sign in
          </h1>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-ink-subtle">
            ● Owner access only
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
