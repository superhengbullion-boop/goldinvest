"use client";

import { useState } from "react";
import { MapEmbed } from "@/components/MapEmbed";
import type { ContactLocation } from "@/lib/types";

export function ContactMapSection({ locations }: { locations: ContactLocation[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = locations[activeIndex] ?? locations[0];

  if (!active) return null;

  return (
    <div>
      {locations.length > 1 ? (
        <div className="mb-4 flex flex-wrap gap-4 max-md:justify-center">
          {locations.map((location, index) => {
            const selected = index === activeIndex;
            return (
              <button
                key={`${location.name}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`text-[1.1rem] max-md:text-base ${
                  selected
                    ? "border-b border-gold text-gold"
                    : "text-ivory hover:text-gold"
                }`}
              >
                {location.name}
              </button>
            );
          })}
        </div>
      ) : null}

      {active.address ? (
        <p className="mb-4 whitespace-pre-line text-[1rem] text-mist max-md:text-center">
          {active.address}
        </p>
      ) : null}

      <MapEmbed url={active.mapEmbedUrl} title={`${active.name} map`} />
    </div>
  );
}
