/**
 * src/app/admin/layout.tsx
 *
 * Outer admin shell layout. Replaces the public site's Nav/Footer entirely.
 * This layout wraps ALL /admin/* routes (both auth and dashboard groups).
 * Fonts (Syne, DM Sans, DM Mono) and globals.css tokens are inherited from
 * the root src/app/layout.tsx — no re-declaration needed here.
 * The grain overlay (body::before) from globals.css applies site-wide.
 */

export const metadata = {
  title: "Admin — NRG",
  robots: "noindex,nofollow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No public Nav / Footer — admin has its own chrome via AdminShell.
  // bg-canvas + text-ink ensure the dark theme holds even before
  // AdminShell renders (avoids flash of white on slow connections).
  return (
    <div className="min-h-screen bg-canvas text-ink antialiased">
      {children}
    </div>
  );
}
