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
    { name: "heroSubtitle", label: "Hero subtitle", type: "textarea" },
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
    { name: "missionText", label: "Mission text", type: "textarea" },
    { name: "missionImage", label: "Mission background", type: "image" },
    { name: "visionTitle", label: "Vision title", type: "text" },
    { name: "visionText", label: "Vision text", type: "textarea" },
    { name: "visionImage", label: "Vision background", type: "image" },
    { name: "coreValueTitle", label: "Core value title", type: "text" },
    { name: "coreValueText", label: "Core value text", type: "textarea" },
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
    { name: "appText", label: "App description", type: "textarea" },
    { name: "webTab", label: "Web tab label", type: "text" },
    { name: "webTitle", label: "Web title", type: "text" },
    { name: "webText", label: "Web description", type: "textarea" },
  ],
  about: [
    { name: "title", label: "Hero title", type: "text" },
    { name: "intro", label: "Hero introduction", type: "textarea" },
    { name: "heroBackground", label: "Hero background", type: "image" },
    { name: "unityTitle", label: "Unity section title", type: "text" },
    { name: "unityBody", label: "Unity section body", type: "textarea" },
    { name: "accessTitle", label: "Accessibility title", type: "text" },
    { name: "accessBody", label: "Accessibility body", type: "textarea" },
    { name: "beyondTitle", label: "Beyond Capabilities title", type: "text" },
    { name: "beyondBody1", label: "Beyond Capabilities paragraph 1", type: "textarea" },
    { name: "beyondBody2", label: "Beyond Capabilities paragraph 2", type: "textarea" },
    { name: "beyondBody3", label: "Beyond Capabilities paragraph 3", type: "textarea" },
    { name: "panelImage", label: "Integrity panel image", type: "image" },
  ],
  terms: [
    { name: "companyName", label: "Company name", type: "text" },
    { name: "title", label: "Document title", type: "text" },
    {
      name: "sections",
      label: "Clauses",
      type: "list",
      itemFields: [
        { name: "heading", label: "Heading", type: "text" },
        { name: "body", label: "Opening paragraph (optional)", type: "textarea" },
      ],
    },
  ],
  rates: [
    { name: "header", label: "Page title", type: "text" },
    { name: "headerText", label: "Intro text", type: "textarea" },
  ],
  contact: [
    { name: "title", label: "Page title", type: "text" },
    { name: "intro", label: "Introduction", type: "text" },
    { name: "companyName", label: "Company name", type: "text" },
    { name: "tel", label: "Telephone", type: "text" },
    { name: "email", label: "Email", type: "text" },
    { name: "address", label: "Address", type: "textarea" },
    { name: "hours", label: "Operating hours", type: "text" },
  ],
};

export function isPageSlug(value: string): value is PageSlug {
  return value in PAGE_META;
}
