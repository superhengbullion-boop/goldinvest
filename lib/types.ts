export type SessionPayload = {
  userId: string;
  expiresAt: string;
};

export type Partner = { name: string; logo?: string };
export type Product = { title: string; icon: string };

export type TermsListItem = {
  term?: string;
  text: string;
  subItems?: string[];
  after?: string;
};

export type TermsSection = {
  heading: string;
  body?: string;
  listStyle?: "disc" | "alpha" | "decimal";
  items?: TermsListItem[];
};

export type HomeContent = {
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  heroBackground: string;
  partnersTitle: string;
  partners: Partner[];
  missionTitle: string;
  missionText: string;
  missionImage: string;
  visionTitle: string;
  visionText: string;
  visionImage: string;
  coreValueTitle: string;
  coreValueText: string;
  coreValueImage: string;
  productsTitle: string;
  products: Product[];
  appTab: string;
  appTitle: string;
  appText: string;
  webTab: string;
  webTitle: string;
  webText: string;
};

export type AboutContent = {
  title: string;
  intro: string;
  heroBackground: string;
  unityTitle: string;
  unityBody: string;
  accessTitle: string;
  accessBody: string;
  beyondTitle: string;
  beyondBody1: string;
  beyondBody2: string;
  beyondBody3: string;
  panelImage: string;
};

export type TermsContent = {
  companyName: string;
  title: string;
  /** Full document below the title (rich HTML). */
  body?: string;
  /** Legacy structured clauses — migrated to `body` when editing. */
  sections?: TermsSection[];
};

export type RatesPageContent = {
  header: string;
  headerText: string;
  passwordTitle: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  passwordButton: string;
  passwordHelp: string;
};

export type ContactLocation = {
  name: string;
  address?: string;
  mapEmbedUrl: string;
};

export type ContactContent = {
  title: string;
  intro: string;
  companyName: string;
  tel: string;
  email: string;
  address: string;
  hours: string;
  locations?: ContactLocation[];
  /** Legacy single-map field — migrated to `locations`. */
  mapEmbedUrl?: string;
};

export type PageSlug = "home" | "about" | "terms" | "rates" | "contact";

export type PageField =
  | {
      name: string;
      label: string;
      type: "text" | "textarea" | "richtext" | "image";
      minHeight?: number;
      hint?: string;
    }
  | {
      name: string;
      label: string;
      type: "list";
      itemFields: {
        name: string;
        label: string;
        type: "text" | "textarea" | "richtext" | "image";
      }[];
    };

export type AuthFormState =
  | { error?: string; errors?: { email?: string[]; password?: string[] } }
  | undefined;

export type MemberPayload = {
  memberId: number;
  expiresAt: string;
};
