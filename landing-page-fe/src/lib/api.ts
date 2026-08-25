const API_URL = "http://localhost:3000";

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
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

  return res.json();
}

// Auth
export const login = (username: string, password: string) =>
  fetchAPI("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const getProfile = () => fetchAPI("/auth/profile");

// Pages
export const getPages = () => fetchAPI("/pages");
export const getPage = (id: string) => fetchAPI(`/pages/${id}`);
export const getPageBySlug = (slug: string) => fetchAPI(`/pages/slug/${slug}`);
export const createPage = (data: any) =>
  fetchAPI("/pages", { method: "POST", body: JSON.stringify(data) });
export const updatePage = (id: string, data: any) =>
  fetchAPI(`/pages/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deletePage = (id: string) =>
  fetchAPI(`/pages/${id}`, { method: "DELETE" });

// Sections
export const createSection = (pageId: string, data: any) =>
  fetchAPI(`/pages/${pageId}/sections`, {
    method: "POST",
    body: JSON.stringify(data),
  });
export const updateSection = (pageId: string, sectionId: string, data: any) =>
  fetchAPI(`/pages/${pageId}/sections/${sectionId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
export const deleteSection = (pageId: string, sectionId: string) =>
  fetchAPI(`/pages/${pageId}/sections/${sectionId}`, { method: "DELETE" });
