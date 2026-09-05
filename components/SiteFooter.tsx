import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-[5%] bg-black py-8">
      <div className="flex justify-center gap-14 text-[1rem] font-normal max-md:flex-col max-md:items-center max-md:gap-4">
        <Link href="/terms" className="hover:text-gold">
          Terms &amp; Conditions
        </Link>
        <Link href="/contact" className="hover:text-gold">
          Contact Us
        </Link>
      </div>
      <p className="mt-4 text-center text-sm text-mist">
        {new Date().getFullYear()} © SUPER HENG BULLION. ALL RIGHTS RESERVED.
      </p>
    </footer>
  );
}
