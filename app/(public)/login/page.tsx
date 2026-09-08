import { MemberLoginForm } from "@/components/MemberLoginForm";

export default async function MemberLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const redirectTo = next === "/rates" || next === "/portal" ? next : "/portal";

  return (
    <div className="mx-[5%] flex min-h-[60vh] items-center justify-center py-12 max-md:py-8">
      <div className="w-full max-w-md rounded-2xl border border-gold/30 bg-ink-2 p-10 max-md:p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Member portal</p>
        <h1 className="mt-3 font-display text-4xl text-ivory max-md:text-3xl">Sign in</h1>
        <p className="mt-2 mb-8 text-sm text-mist">
          Use your username and password to view rates and manage your profile.
        </p>
        <MemberLoginForm next={redirectTo} />
      </div>
    </div>
  );
}
