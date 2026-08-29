// Page types
export interface Page {
  id: string;
  title: string;
  slug: string;
  description?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  sections?: Section[];
}

export interface CreatePageInput {
  title: string;
  slug: string;
  description?: string;
  isPublished?: boolean;
}

export interface UpdatePageInput {
  title?: string;
  slug?: string;
  description?: string;
  isPublished?: boolean;
}

export interface PageFilters {
  search?: string;
  isPublished?: boolean;
  sortBy?: "title" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

// Section types
export type SectionType = "hero" | "features" | "cta" | "stats" | "testimonials";

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

export type SectionContent =
  | HeroContent
  | FeaturesContent
  | CtaContent
  | StatsContent
  | TestimonialsContent;

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
