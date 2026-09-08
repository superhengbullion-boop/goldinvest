import type { PageField, PageSlug } from "@/lib/types";

export const PAGE_META: Record<
  PageSlug,
  { href: string; navLabel: string; cmsLabel: string }
> = {
  home: { href: "/", navLabel: "Home", cmsLabel: "Home" },
  about: { href: "/about", navLabel: "About", cmsLabel: "About" },
  terms: {
    href: "/terms",
    navLabel: "Terms",
    cmsLabel: "Terms and Conditions",
  },
  rates: { href: "/rates", navLabel: "Rates", cmsLabel: "Rates" },
  contact: { href: "/contact", navLabel: "Contact Us", cmsLabel: "Contact Us" },
};

export const NAV_LINKS = (
  ["home", "about", "terms", "rates", "contact"] as const
).map((slug) => ({ href: PAGE_META[slug].href, label: PAGE_META[slug].navLabel }));

export const PAGE_FIELDS: Record<PageSlug, PageField[]> = {
  home: [
    { name: "heroTitle", label: "Hero title", type: "text" },
    { name: "heroSubtitle", label: "Hero subtitle", type: "richtext" },
    { name: "heroCta", label: "Hero button", type: "text" },
    { name: "heroBackground", label: "Hero background", type: "image" },
    { name: "partnersTitle", label: "Partners section title", type: "text" },
    {
      name: "partners",
      label: "Trusted partners",
      type: "list",
      itemFields: [
        { name: "name", label: "Name", type: "text" },
        { name: "logo", label: "Logo", type: "image" },
      ],
    },
    { name: "missionTitle", label: "Mission title", type: "text" },
    { name: "missionText", label: "Mission text", type: "richtext" },
    { name: "missionImage", label: "Mission background", type: "image" },
    { name: "visionTitle", label: "Vision title", type: "text" },
    { name: "visionText", label: "Vision text", type: "richtext" },
    { name: "visionImage", label: "Vision background", type: "image" },
    { name: "coreValueTitle", label: "Core value title", type: "text" },
    { name: "coreValueText", label: "Core value text", type: "richtext" },
    { name: "coreValueImage", label: "Core value background", type: "image" },
    { name: "productsTitle", label: "Products section title", type: "text" },
    {
      name: "products",
      label: "Products & services",
      type: "list",
      itemFields: [
        { name: "title", label: "Title", type: "text" },
        {
          name: "icon",
          label: "Icon (exchange, delivery, clock, booking, diamond, safe, malaysia, software)",
          type: "text",
        },
      ],
    },
    { name: "appTab", label: "App tab label", type: "text" },
    { name: "appTitle", label: "App title", type: "text" },
    { name: "appText", label: "App description", type: "richtext" },
    { name: "webTab", label: "Web tab label", type: "text" },
    { name: "webTitle", label: "Web title", type: "text" },
    { name: "webText", label: "Web description", type: "richtext" },
  ],
  about: [
    { name: "title", label: "Hero title", type: "text" },
    { name: "intro", label: "Hero introduction", type: "richtext" },
    { name: "heroBackground", label: "Hero background", type: "image" },
    { name: "unityTitle", label: "Unity section title", type: "text" },
    { name: "unityBody", label: "Unity section body", type: "richtext" },
    { name: "accessTitle", label: "Accessibility title", type: "text" },
    { name: "accessBody", label: "Accessibility body", type: "richtext" },
    { name: "beyondTitle", label: "Beyond Capabilities title", type: "text" },
    { name: "beyondBody1", label: "Beyond Capabilities paragraph 1", type: "richtext" },
    { name: "beyondBody2", label: "Beyond Capabilities paragraph 2", type: "richtext" },
    { name: "beyondBody3", label: "Beyond Capabilities paragraph 3", type: "richtext" },
    { name: "panelImage", label: "Integrity panel image", type: "image" },
  ],
  terms: [
    { name: "companyName", label: "Company name", type: "text" },
    { name: "title", label: "Document title", type: "text" },
    {
      name: "body",
      label: "Document content",
      type: "richtext",
      minHeight: 480,
    },
  ],
  rates: [
    { name: "header", label: "Page title", type: "text" },
    { name: "headerText", label: "Intro text", type: "richtext" },
  ],
  contact: [
    { name: "title", label: "Page title", type: "text" },
    { name: "intro", label: "Introduction", type: "richtext" },
    { name: "companyName", label: "Company name", type: "text" },
    { name: "tel", label: "Telephone", type: "text" },
    { name: "email", label: "Email", type: "text" },
    { name: "address", label: "Address", type: "textarea" },
    { name: "hours", label: "Operating hours", type: "text" },
    {
      name: "mapEmbedUrl",
      label: "Google Map embed",
      type: "textarea",
      hint: "Paste the embed URL from Google Maps (Share → Embed a map), or the full iframe code.",
    },
  ],
};

export function isPageSlug(value: string): value is PageSlug {
  return value in PAGE_META;
}
