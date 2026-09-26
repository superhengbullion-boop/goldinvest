import { LoginForm } from "@/components/admin/LoginForm";
import { getSiteSettings } from "@/lib/data";

export default async function LoginPage() {
  const site = await getSiteSettings();

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-md rounded-2xl border border-gold/30 bg-ink-2 p-10">
        <img
          src={site.logo || "/logo.jpg"}
          alt={site.siteName}
          className="mb-6 h-20 w-20 rounded-full object-cover bg-white"
        />
        <p className="text-xs uppercase tracking-[0.3em] text-gold">{site.siteName}</p>
        <h1 className="mt-3 font-display text-4xl text-ivory">Sign in</h1>
        <p className="mt-2 mb-8 text-sm text-mist">
          Manage pages, rates, and enquiries.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
