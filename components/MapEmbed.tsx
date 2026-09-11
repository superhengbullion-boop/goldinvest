import { resolveMapEmbedUrl } from "@/lib/map-embed";

export function MapEmbed({ url, title = "Location map" }: { url?: string; title?: string }) {
  const src = resolveMapEmbedUrl(url);

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl border border-gold/20 bg-ink-2">
      <iframe
        key={src}
        src={src}
        className="h-full w-full border-0"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        title={title}
      />
    </div>
  );
}
