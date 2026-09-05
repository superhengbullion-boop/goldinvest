"use client";

import { useState } from "react";

type Props = {
  appTab: string;
  appTitle: string;
  appText: string;
  webTab: string;
  webTitle: string;
  webText: string;
};

export function SystemsTabs({
  appTab,
  appTitle,
  appText,
  webTab,
  webTitle,
  webText,
}: Props) {
  const [tab, setTab] = useState<"app" | "web">("app");
  const active = tab === "app";

  return (
    <div className="mx-[10%] mt-[5%] overflow-hidden rounded-xl bg-gradient-to-l from-[#EDBE0120] from-1% via-black via-30% to-black p-[5%] max-md:mx-[5%]">
      <div className="flex justify-center gap-8">
        <button
          type="button"
          onClick={() => setTab("app")}
          className={`text-[1.2rem] ${active ? "border-b border-gold text-gold" : "text-ivory hover:text-gold"}`}
        >
          {appTab}
        </button>
        <button
          type="button"
          onClick={() => setTab("web")}
          className={`text-[1.2rem] ${!active ? "border-b border-gold text-gold" : "text-ivory hover:text-gold"}`}
        >
          {webTab}
        </button>
      </div>
      <div className="mt-[5%] flex h-[50vh] items-center gap-12 max-md:h-auto max-md:flex-col">
        <div className="flex-1">
          <h2 className="font-display text-[1.6rem] text-gold">
            {active ? appTitle : webTitle}
          </h2>
          <p className="mt-[3%] text-[1rem] text-mist">{active ? appText : webText}</p>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-gold/30 pattern-gold">
            <div className="absolute inset-6 rounded-lg border border-gold/40 bg-ink/50 p-6">
              <p className="font-display text-3xl text-gold">
                {active ? "Buy · Sell · Settle" : "Live Market Board"}
              </p>
              <p className="mt-4 text-sm text-mist">
                {active
                  ? "Spot orders, daily settlement, and trade confirmations in your pocket."
                  : "Real-time quotes, order tickets, and secure gold asset management."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
