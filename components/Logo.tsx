import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      <img
        src="/logo.jpg"
        alt="Super Heng Bullion"
        className="h-14 w-14 rounded-full object-cover bg-white"
      />
      <span className="font-display text-lg tracking-wide text-ivory max-md:hidden">
        Super Heng <span className="text-gold">Bullion</span>
      </span>
    </Link>
  );
}
