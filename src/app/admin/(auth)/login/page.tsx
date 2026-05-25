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
      {/* Radial glow behind form */}
      <div
        aria-hidden
        className="pointer-events-none fixed -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl opacity-40"
      />

      <div className="relative w-full max-w-sm">
        {/* Logo / wordmark */}
        <div className="mb-10 text-center">
          <span className="font-display text-2xl font-extrabold tracking-tight text-ink">
            NRG
          </span>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-ink-subtle">
            Admin Panel
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
