"use client";

import { useMemo, useState } from "react";
import { updatePage } from "@/app/actions/admin";
import { ImageField } from "@/components/admin/ImageField";
import { RichTextField } from "@/components/admin/RichTextField";
import type { PageField } from "@/lib/types";

type Props = {
  slug: string;
  title: string;
  description: string;
  content: Record<string, unknown>;
  fields: PageField[];
};

function emptyItem(fields: { name: string }[]) {
  return Object.fromEntries(fields.map((f) => [f.name, ""]));
}

export function PageEditor({ slug, title, description, content, fields }: Props) {
  const [pageTitle, setPageTitle] = useState(title);
  const [pageDescription, setPageDescription] = useState(description);
  const [values, setValues] = useState<Record<string, unknown>>(content);
  const [saved, setSaved] = useState(false);

  const payload = useMemo(() => JSON.stringify(values), [values]);

  function setField(name: string, value: unknown) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  }

  return (
    <form
      action={async (formData) => {
        await updatePage(formData);
        setSaved(true);
      }}
      className="space-y-8"
    >
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="content" value={payload} />

      <label className="block">
        <span className="mb-2 block text-sm text-mist">Page title (SEO)</span>
        <input
          name="title"
          value={pageTitle}
          onChange={(e) => setPageTitle(e.target.value)}
          className="w-full rounded-lg border border-gold/30 bg-ink px-4 py-3 outline-none focus:border-gold"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-mist">Meta description</span>
        <textarea
          name="description"
          value={pageDescription}
          onChange={(e) => setPageDescription(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-gold/30 bg-ink px-4 py-3 outline-none focus:border-gold"
        />
      </label>

      {fields.map((field) => {
        if (field.type === "list") {
          const items = Array.isArray(values[field.name])
            ? (values[field.name] as Record<string, string>[])
            : [];
          return (
            <fieldset key={field.name} className="rounded-xl border border-gold/20 p-5">
              <legend className="px-2 text-gold">{field.label}</legend>
              <div className="space-y-6">
                {items.map((item, index) => (
                  <div key={index} className="rounded-lg bg-ink-2 p-4">
                    {field.itemFields.map((itemField) => (
                      itemField.type === "image" ? (
                        <div key={itemField.name} className="mb-3">
                          <ImageField
                            compact
                            label={itemField.label}
                            value={item[itemField.name] ?? ""}
                            onChange={(url) => {
                              const next = [...items];
                              next[index] = { ...next[index], [itemField.name]: url };
                              setField(field.name, next);
                            }}
                          />
                        </div>
                      ) : (
                      <label key={itemField.name} className="mb-3 block">
                        <span className="mb-1 block text-xs uppercase tracking-wide text-mist">
                          {itemField.label}
                        </span>
                        {itemField.type === "richtext" ? (
                          <RichTextField
                            label={itemField.label}
                            value={item[itemField.name] ?? ""}
                            onChange={(html) => {
                              const next = [...items];
                              next[index] = { ...next[index], [itemField.name]: html };
                              setField(field.name, next);
                            }}
                          />
                        ) : itemField.type === "textarea" ? (
                          <textarea
                            rows={3}
                            value={item[itemField.name] ?? ""}
                            onChange={(e) => {
                              const next = [...items];
                              next[index] = { ...next[index], [itemField.name]: e.target.value };
                              setField(field.name, next);
                            }}
                            className="w-full rounded border border-gold/20 bg-ink px-3 py-2 outline-none focus:border-gold"
                          />
                        ) : (
                          <input
                            value={item[itemField.name] ?? ""}
                            onChange={(e) => {
                              const next = [...items];
                              next[index] = { ...next[index], [itemField.name]: e.target.value };
                              setField(field.name, next);
                            }}
                            className="w-full rounded border border-gold/20 bg-ink px-3 py-2 outline-none focus:border-gold"
                          />
                        )}
                      </label>
                      )
                    ))}
                    <button
                      type="button"
                      className="text-sm text-red-400"
                      onClick={() => setField(field.name, items.filter((_, i) => i !== index))}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="mt-4 text-sm text-gold"
                onClick={() => setField(field.name, [...items, emptyItem(field.itemFields)])}
              >
                + Add {field.label.toLowerCase()}
              </button>
            </fieldset>
          );
        }

        const value = String(values[field.name] ?? "");
        if (field.type === "image") {
          return (
            <ImageField
              key={field.name}
              label={field.label}
              value={value}
              onChange={(url) => setField(field.name, url)}
            />
          );
        }
        if (field.type === "richtext") {
          return (
            <RichTextField
              key={field.name}
              label={field.label}
              value={value}
              minHeight={field.minHeight}
              onChange={(html) => setField(field.name, html)}
            />
          );
        }
        return (
          <label key={field.name} className="block">
            <span className="mb-2 block text-sm text-mist">{field.label}</span>
            {field.type === "textarea" ? (
              <textarea
                rows={4}
                value={value}
                onChange={(e) => setField(field.name, e.target.value)}
                className="w-full rounded-lg border border-gold/30 bg-ink px-4 py-3 outline-none focus:border-gold"
              />
            ) : (
              <input
                value={value}
                onChange={(e) => setField(field.name, e.target.value)}
                className="w-full rounded-lg border border-gold/30 bg-ink px-4 py-3 outline-none focus:border-gold"
              />
            )}
            {field.hint ? <p className="mt-2 text-xs text-mist">{field.hint}</p> : null}
          </label>
        );
      })}

      <div className="flex items-center gap-4">
        <button type="submit" className="gold-btn">
          Save page
        </button>
        {saved ? <span className="text-sm text-gold">Saved</span> : null}
      </div>
    </form>
  );
}
