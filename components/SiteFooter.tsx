import Link from "next/link";

export function SiteFooter({ siteName = "Super Heng Bullion" }: { siteName?: string }) {
  return (
    <footer className="mt-[5%] bg-black py-8 max-md:mt-8 max-md:py-6">
      <div className="flex justify-center gap-14 px-[5%] text-[1rem] font-normal max-md:flex-col max-md:items-center max-md:gap-4 max-md:text-center">
        <Link href="/terms" className="hover:text-gold">
          Terms &amp; Conditions
        </Link>
        <Link href="/contact" className="hover:text-gold">
          Contact Us
        </Link>
      </div>
      <p className="mt-4 px-[5%] text-center text-sm text-mist">
        {new Date().getFullYear()} © {siteName.toUpperCase()}. ALL RIGHTS RESERVED.
      </p>
    </footer>
  );
}
