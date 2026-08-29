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
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImage?: string;
}

export interface FeatureItem {
  title: string;
  description: string;
  icon?: string;
}

export interface FeaturesContent {
  title?: string;
  subtitle?: string;
  items: FeatureItem[];
}

export interface CtaContent {
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface StatsContent {
  title?: string;
  subtitle?: string;
  items: StatItem[];
}

export interface TestimonialItem {
  name: string;
  role?: string;
  content: string;
  avatar?: string;
}

export interface TestimonialsContent {
  title?: string;
  subtitle?: string;
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
