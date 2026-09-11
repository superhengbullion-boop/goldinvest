"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchMarketRates } from "@/lib/market-client";
import type {
  MarketApiResponse,
  MarketBoardRow,
  MarketTickerItem,
} from "@/lib/market-types";
import { MARKET_POLL_MS } from "@/lib/market-types";

type MetalState = {
  rows: MarketBoardRow[];
  updatedAt: Date | null;
};

type MarketRatesContextValue = {
  enabled: boolean;
  loading: boolean;
  error: string | null;
  ticker: MarketTickerItem[];
  gold: MetalState;
  silver: MetalState;
};

const EMPTY_METAL: MetalState = { rows: [], updatedAt: null };

const MarketRatesContext = createContext<MarketRatesContextValue>({
  enabled: false,
  loading: false,
  error: null,
  ticker: [],
  gold: EMPTY_METAL,
  silver: EMPTY_METAL,
});

function parseUpdatedAt(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toMetalState(payload: MarketApiResponse["gold"]): MetalState {
  return {
    rows: payload.rows,
    updatedAt: parseUpdatedAt(payload.updatedAt),
  };
}

export function MarketRatesProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [ticker, setTicker] = useState<MarketTickerItem[]>([]);
  const [gold, setGold] = useState<MetalState>(EMPTY_METAL);
  const [silver, setSilver] = useState<MetalState>(EMPTY_METAL);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setError(null);
      setTicker([]);
      setGold(EMPTY_METAL);
      setSilver(EMPTY_METAL);
      return;
    }

    let active = true;
    let timer: number | undefined;

    async function refresh() {
      if (document.hidden) return;

      try {
        const data = await fetchMarketRates();
        if (!active) return;

        setTicker(data.ticker);
        setGold(toMetalState(data.gold));
        setSilver(toMetalState(data.silver));
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Unable to load live rates.");
      } finally {
        if (active) setLoading(false);
      }
    }

    async function loop() {
      await refresh();
      if (!active) return;
      timer = window.setTimeout(loop, MARKET_POLL_MS);
    }

    void loop();

    function onVisibilityChange() {
      if (document.hidden) {
        if (timer != null) window.clearTimeout(timer);
        return;
      }
      if (timer != null) window.clearTimeout(timer);
      void loop();
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      active = false;
      if (timer != null) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [enabled]);

  const value = useMemo(
    () => ({ enabled, loading, error, ticker, gold, silver }),
    [enabled, loading, error, ticker, gold, silver],
  );

  return <MarketRatesContext.Provider value={value}>{children}</MarketRatesContext.Provider>;
}

export function useMarketRates() {
  return useContext(MarketRatesContext);
}
