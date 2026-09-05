"use client";

import { useRef, useState, useTransition } from "react";
import { uploadMedia } from "@/app/actions/media";

export function ImageField({
  label,
  value,
  onChange,
  compact = false,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const isVideo = value.toLowerCase().endsWith(".mp4");

  function onFile(file: File | undefined) {
    if (!file) return;
    const data = new FormData();
    data.set("file", file);
    setError("");
    startTransition(async () => {
      try {
        const url = await uploadMedia(data);
        onChange(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
      }
    });
  }

  return (
    <div>
      <span className="mb-2 block text-sm text-mist">{label}</span>
      <div className="overflow-hidden rounded-xl border border-gold/30 bg-ink">
        <div className={compact ? "relative mx-auto aspect-square w-28 bg-ink-2" : "relative aspect-[17/8] bg-ink-2"}>
          {value && isVideo ? (
            <video src={value} className="h-full w-full object-cover" muted playsInline />
          ) : value ? (
            // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className={`h-full w-full ${compact ? "object-contain p-3" : "object-cover"}`} />
          ) : (
            <div className="gold-shimmer h-full w-full" />
          )}
        </div>
        <div className="space-y-3 p-4">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4"
            className="hidden"
            onChange={(e) => {
              onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="gold-btn py-2"
              disabled={pending}
              onClick={() => inputRef.current?.click()}
            >
              {pending ? "Uploading…" : value ? "Replace file" : "Upload file"}
            </button>
            {value ? (
              <button type="button" className="text-sm text-red-400" onClick={() => onChange("")}>
                Remove
              </button>
            ) : null}
          </div>
          <label className="block text-xs text-mist">
            Or paste an image / video URL
            <input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="/uploads/hero.jpg"
              className="mt-1 w-full rounded border border-gold/20 bg-ink px-3 py-2 text-sm text-ivory outline-none focus:border-gold"
            />
          </label>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <p className="text-xs text-mist">Save the page after uploading to show it on the site.</p>
        </div>
      </div>
    </div>
  );
}
