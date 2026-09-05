import Link from "next/link";

type Props = {
  href?: string;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
};

export function GoldButton({ href, children, className = "", type = "button" }: Props) {
  const cls = `gold-btn ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls}>
      {children}
    </button>
  );
}
