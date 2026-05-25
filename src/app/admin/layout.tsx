/**
 * src/app/admin/layout.tsx
 *
 * Outer admin shell layout. Replaces the public site's Nav/Footer entirely.
 * This layout wraps ALL /admin/* routes (both auth and dashboard groups).
 * Fonts and globals.css tokens are inherited from the root layout.
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
  return (
    <div className="min-h-screen bg-canvas text-ink">
      {children}
    </div>
  );
}
