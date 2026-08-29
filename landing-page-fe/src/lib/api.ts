import type {
  Page,
  CreatePageInput,
  UpdatePageInput,
  Section,
  CreateSectionInput,
  UpdateSectionInput,
  AuthResponse,
  Profile,
} from "@/types";

const API_URL = "http://localhost:3000";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "API Error");
  }

  const json: ApiResponse<T> = await res.json();
  return json.data;
}

// Auth
export const login = (username: string, password: string) =>
  fetchAPI<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const getProfile = () => fetchAPI<Profile>("/auth/profile");

// Pages
export const getPages = () => fetchAPI<Page[]>("/pages");
export const getPage = (id: string) => fetchAPI<Page>(`/pages/${id}`);
export const getPageBySlug = (slug: string) => fetchAPI<Page>(`/pages/slug/${slug}`);
export const createPage = (data: CreatePageInput) =>
  fetchAPI<Page>("/pages", { method: "POST", body: JSON.stringify(data) });
export const updatePage = (id: string, data: UpdatePageInput) =>
  fetchAPI<Page>(`/pages/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deletePage = (id: string) =>
  fetchAPI<void>(`/pages/${id}`, { method: "DELETE" });

// Sections
export const createSection = (pageId: string, data: CreateSectionInput) =>
  fetchAPI<Section>(`/pages/${pageId}/sections`, {
    method: "POST",
    body: JSON.stringify(data),
  });
export const updateSection = (pageId: string, sectionId: string, data: UpdateSectionInput) =>
  fetchAPI<Section>(`/pages/${pageId}/sections/${sectionId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
export const deleteSection = (pageId: string, sectionId: string) =>
  fetchAPI<void>(`/pages/${pageId}/sections/${sectionId}`, { method: "DELETE" });
