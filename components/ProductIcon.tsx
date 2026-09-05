const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function ExchangeIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden>
      <rect x="8" y="8" width="32" height="32" rx="8" {...stroke} />
      <path d="M16 20h16l-5-5" {...stroke} />
      <path d="M32 28H16l5 5" {...stroke} />
    </svg>
  );
}

function DeliveryIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden>
      <path d="M6 24h8" {...stroke} />
      <path d="M8 18h6" {...stroke} />
      <path d="M8 30h6" {...stroke} />
      <path d="M18 18h18v16H18z" {...stroke} />
      <path d="M18 26h18" {...stroke} />
      <path d="M22 18v8" {...stroke} />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden>
      <circle cx="24" cy="24" r="14" {...stroke} />
      <path d="M24 16v9l6 3" {...stroke} />
    </svg>
  );
}

function BookingIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden>
      <path d="M16 12h16a4 4 0 0 1 4 4v20H16a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z" {...stroke} />
      <path d="M16 12v24" {...stroke} />
      <path d="M20 20h10" {...stroke} />
      <path d="M20 26h8" {...stroke} />
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden>
      <path d="M24 10 38 24 24 38 10 24z" {...stroke} />
      <path d="M16 16h16L24 38z" {...stroke} />
    </svg>
  );
}

function SafeIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden>
      <rect x="10" y="12" width="28" height="26" rx="2" {...stroke} />
      <circle cx="24" cy="25" r="6" {...stroke} />
      <path d="M24 19v3" {...stroke} />
      <path d="M24 28v3" {...stroke} />
      <path d="M18 25h3" {...stroke} />
      <path d="M27 25h3" {...stroke} />
    </svg>
  );
}

function MalaysiaIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden>
      {/* Left spire */}
      <path d="M17 4v6" {...stroke} />
      {/* Left crown */}
      <path d="M13 14 17 10l4 4v4h-8z" {...stroke} />
      {/* Left shaft */}
      <path d="M13 18h8v24h-8z" {...stroke} />
      {/* Right spire */}
      <path d="M31 4v6" {...stroke} />
      {/* Right crown */}
      <path d="M27 14 31 10l4 4v4h-8z" {...stroke} />
      {/* Right shaft */}
      <path d="M27 18h8v24h-8z" {...stroke} />
      {/* Skybridge */}
      <path d="M21 20h6v5h-6z" {...stroke} />
      <path d="M24 25v3" {...stroke} />
    </svg>
  );
}

function SoftwareIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden>
      <rect x="9" y="10" width="30" height="22" rx="2" {...stroke} />
      <path d="M16 38h16" {...stroke} />
      <path d="M24 32v6" {...stroke} />
      <circle cx="24" cy="21" r="5" {...stroke} />
      <path d="M24 16v2" {...stroke} />
      <path d="M24 24v2" {...stroke} />
      <path d="M19 21h2" {...stroke} />
      <path d="M27 21h2" {...stroke} />
    </svg>
  );
}

const ICONS: Record<string, () => React.JSX.Element> = {
  exchange: ExchangeIcon,
  delivery: DeliveryIcon,
  clock: ClockIcon,
  booking: BookingIcon,
  diamond: DiamondIcon,
  safe: SafeIcon,
  malaysia: MalaysiaIcon,
  software: SoftwareIcon,
};

export function ProductIcon({ name }: { name: string }) {
  const Icon = ICONS[name] ?? ExchangeIcon;
  return (
    <span className="inline-flex text-gold">
      <Icon />
    </span>
  );
}
