import type { Partner } from "@/lib/types";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "P";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function fillRow(partners: Partner[], min = 8) {
  const source = partners.length > 0 ? partners : [{ name: "Partner", logo: "" }];
  const filled = [...source];
  while (filled.length < min) {
    filled.push(...source);
  }
  return [...filled, ...filled];
}

function PartnerOrb({ partner, delay }: { partner: Partner; delay: string }) {
  return (
    <div className="partner-orb" title={partner.name}>
      <div className="partner-sphere" style={{ animationDelay: delay }}>
        {partner.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={partner.logo} alt={partner.name} />
        ) : (
          <span className="partner-placeholder">{initials(partner.name)}</span>
        )}
      </div>
    </div>
  );
}

export function TrustedPartners({
  title,
  partners,
}: {
  title: string;
  partners: Partner[];
}) {
  const top = fillRow(partners);
  const bottom = fillRow([...partners].reverse());

  return (
    <section className="pt-[3%]">
      <p className="text-center text-[1.6rem] text-ivory">{title}</p>
      <div className="partners-stage mt-8 py-6">
        <div className="partners-row partners-row--dim">
          <div className="partners-track partners-track--left">
            {top.map((partner, i) => (
              <PartnerOrb
                key={`top-${partner.name}-${i}`}
                partner={partner}
                delay={`${(i % 8) * 0.35}s`}
              />
            ))}
          </div>
        </div>
        <div className="partners-row mt-5">
          <div className="partners-track partners-track--right">
            {bottom.map((partner, i) => (
              <PartnerOrb
                key={`bottom-${partner.name}-${i}`}
                partner={partner}
                delay={`${(i % 8) * 0.35 + 0.2}s`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
