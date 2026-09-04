// Page types
export interface Page {
  id: string;
  title: string;
  slug: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  keywords?: string;
  canonicalUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  sections?: Section[];
}

export interface CreatePageInput {
  title: string;
  slug: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  keywords?: string;
  canonicalUrl?: string;
  isPublished?: boolean;
  sections?: TemplateSectionDef[];
}

export interface UpdatePageInput {
  title?: string;
  slug?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  keywords?: string;
  canonicalUrl?: string;
  isPublished?: boolean;
}

export interface PageFilters {
  search?: string;
  isPublished?: boolean;
  sortBy?: "title" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

// Section types
export type SectionType =
  | "hero"
  | "features"
  | "cta"
  | "stats"
  | "testimonials"
  | "pricing"
  | "faq"
  | "logoCloud"
  | "team"
  | "gallery"
  | "contact"
  | "compare"
  | "banner";

export interface Section {
  id: string;
  type: SectionType;
  content: SectionContent;
  order: number;
  pageId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSectionInput {
  type: SectionType;
  content: SectionContent;
  order?: number;
}

export interface UpdateSectionInput {
  type?: SectionType;
  content?: SectionContent;
  order?: number;
}

// Section content types
export interface HeroContent {
  heading?: string;
  subheading?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

export interface FeatureItem {
  icon?: string;
  name: string;
  description: string;
}

export interface FeaturesContent {
  subtitle?: string;
  title?: string;
  description?: string;
  items: FeatureItem[];
}

export interface CtaContent {
  heading?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

export interface StatItem {
  value: number;
  suffix?: string;
  label: string;
}

export interface StatsContent {
  title?: string;
  items: StatItem[];
}

export interface TestimonialItem {
  quote?: string;
  name: string;
  role?: string;
  avatar?: string;
}

export interface TestimonialsContent {
  subtitle?: string;
  title?: string;
  description?: string;
  items: TestimonialItem[];
}

// New section content types
export interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  highlighted?: boolean;
  buttonText?: string;
  buttonLink?: string;
}

export interface PricingContent {
  subtitle?: string;
  title?: string;
  description?: string;
  plans: PricingPlan[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqContent {
  subtitle?: string;
  title?: string;
  description?: string;
  items: FaqItem[];
}

export interface LogoItem {
  name: string;
  url?: string;
  imageUrl?: string;
}

export interface LogoCloudContent {
  subtitle?: string;
  title?: string;
  items: LogoItem[];
}

export interface TeamMember {
  name: string;
  role?: string;
  avatar?: string;
  bio?: string;
}

export interface TeamContent {
  subtitle?: string;
  title?: string;
  description?: string;
  members: TeamMember[];
}

export interface GalleryImage {
  url: string;
  alt?: string;
  caption?: string;
}

export interface GalleryContent {
  subtitle?: string;
  title?: string;
  description?: string;
  images: GalleryImage[];
  columns?: number;
}

export interface ContactContent {
  subtitle?: string;
  title?: string;
  description?: string;
  fields?: string[];
  submitText?: string;
}

export interface CompareFeature {
  name: string;
  values: string[];
}

export interface CompareContent {
  title?: string;
  columns: string[];
  features: CompareFeature[];
}

export interface BannerContent {
  text: string;
  link?: string;
  linkText?: string;
  dismissible?: boolean;
}

export type SectionContent =
  | HeroContent
  | FeaturesContent
  | CtaContent
  | StatsContent
  | TestimonialsContent
  | PricingContent
  | FaqContent
  | LogoCloudContent
  | TeamContent
  | GalleryContent
  | ContactContent
  | CompareContent
  | BannerContent;

// Template types
export interface TemplateSectionDef {
  type: SectionType;
  content: SectionContent;
  order: number;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  sections: TemplateSectionDef[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
  sections: TemplateSectionDef[];
}

// Auth types
export interface LoginInput {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface Profile {
  id: string;
  username: string;
}
