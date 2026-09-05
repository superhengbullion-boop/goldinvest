import { LoginForm } from "@/components/admin/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-md rounded-2xl border border-gold/30 bg-ink-2 p-10">
        <img
          src="/logo.jpg"
          alt="Super Heng Bullion"
          className="mb-6 h-20 w-20 rounded-full object-cover bg-white"
        />
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Super Heng Bullion</p>
        <h1 className="mt-3 font-display text-4xl text-ivory">Sign in</h1>
        <p className="mt-2 mb-8 text-sm text-mist">
          Manage pages, rates, and enquiries.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
