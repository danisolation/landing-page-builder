import type {
  Page,
  CreatePageInput,
  UpdatePageInput,
  Section,
  CreateSectionInput,
  UpdateSectionInput,
  Template,
  CreateTemplateInput,
  AuthResponse,
  Profile,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
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
    // 401 → token hết hạn, redirect về login (đúng locale hiện tại)
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      document.cookie = "token=; path=/; max-age=0";
      const locale = window.location.pathname.split("/")[1] || "vi";
      window.location.href = `/${locale}/login`;
      throw new Error(
        locale === "en"
          ? "Your session has expired. Please log in again."
          : "Phiên đăng nhập đã hết hạn",
      );
    }

    // Handle non-JSON error responses (e.g. 502 from proxy)
    let errorMessage = "API Error";
    try {
      const error = await res.json();
      errorMessage = error.message || errorMessage;
    } catch {
      errorMessage = `HTTP ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const json: ApiResponse<T> = await res.json();
  return json.data;
}

// Media upload (multipart) — returns the public URL of the stored image
export async function uploadMedia(file: File): Promise<{ url: string }> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const body = new FormData();
  body.append("file", file);

  const res = await fetch(`${API_URL}/media`, {
    method: "POST",
    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    body,
  });

  if (!res.ok) {
    let errorMessage = "Upload failed";
    try {
      const error = await res.json();
      errorMessage = error.message || errorMessage;
    } catch {
      errorMessage = `HTTP ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const json: ApiResponse<{ url: string }> = await res.json();
  return json.data;
}

// Fire-and-forget view counter for published pages.
// Deduped per browser session so remounts (StrictMode, back-nav) and
// repeat visits within one session don't inflate the count.
export function incrementPageView(pageId: string): void {
  if (typeof window === "undefined") return;
  const key = `viewed:${pageId}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    // Storage unavailable (private mode) — count anyway
  }
  fetch(`${API_URL}/pages/${pageId}/view`, { method: "POST" }).catch(() => {
    // View counting must never break the page
  });
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
export const getPageBySlug = (slug: string) =>
  fetchAPI<Page>(`/pages/slug/${slug}`);
export const createPage = (data: CreatePageInput) =>
  fetchAPI<Page>("/pages", { method: "POST", body: JSON.stringify(data) });
export const updatePage = (id: string, data: UpdatePageInput) =>
  fetchAPI<Page>(`/pages/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
export const deletePage = (id: string) =>
  fetchAPI<void>(`/pages/${id}`, { method: "DELETE" });

// Sections
export const createSection = (pageId: string, data: CreateSectionInput) =>
  fetchAPI<Section>(`/pages/${pageId}/sections`, {
    method: "POST",
    body: JSON.stringify(data),
  });
export const updateSection = (
  pageId: string,
  sectionId: string,
  data: UpdateSectionInput,
) =>
  fetchAPI<Section>(`/pages/${pageId}/sections/${sectionId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
export const deleteSection = (pageId: string, sectionId: string) =>
  fetchAPI<void>(`/pages/${pageId}/sections/${sectionId}`, {
    method: "DELETE",
  });

// Templates
export const getTemplates = () => fetchAPI<Template[]>("/templates");
export const createTemplate = (data: CreateTemplateInput) =>
  fetchAPI<Template>("/templates", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const deleteTemplate = (id: string) =>
  fetchAPI<void>(`/templates/${id}`, { method: "DELETE" });
