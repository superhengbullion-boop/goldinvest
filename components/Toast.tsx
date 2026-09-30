"use client";

import { useEffect, useState } from "react";

export function Toast({
  message,
  show,
  tone = "success",
  onClose,
  duration = 2600,
}: {
  message: string;
  show: boolean;
  tone?: "success" | "error";
  onClose: () => void;
  duration?: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) return;
    setVisible(false);
    const enter = window.requestAnimationFrame(() => setVisible(true));
    const hideTimer = window.setTimeout(() => setVisible(false), duration);
    const closeTimer = window.setTimeout(onClose, duration + 300);
    return () => {
      window.cancelAnimationFrame(enter);
      window.clearTimeout(hideTimer);
      window.clearTimeout(closeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, duration]);

  if (!show) return null;

  const isSuccess = tone === "success";

  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-[100] flex justify-center px-4">
      <div
        role="status"
        className={`pointer-events-auto flex items-center gap-3 rounded-lg border px-5 py-3 shadow-lg backdrop-blur transition-all duration-300 ${
          visible ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
        } ${
          isSuccess
            ? "border-gold/40 bg-ink/95 text-ivory"
            : "border-red-400/40 bg-ink/95 text-ivory"
        }`}
      >
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
            isSuccess ? "bg-gold text-black" : "bg-red-500 text-white"
          }`}
        >
          {isSuccess ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <path d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          )}
        </span>
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}
