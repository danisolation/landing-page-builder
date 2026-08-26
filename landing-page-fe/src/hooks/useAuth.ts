"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@/i18n/navigation";
import { login as loginAPI } from "@/lib/api";

export function useAuth() {
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: (data: { username: string; password: string }) =>
      loginAPI(data.username, data.password),
    onSuccess: (data) => {
      localStorage.setItem("token", data.access_token);
      // Lưu vào cookie cho middleware
      document.cookie = `token=${data.access_token}; path=/; max-age=86400`;
      router.push("/dashboard");
    },
  });

  const logout = () => {
    localStorage.removeItem("token");
    // Xóa cookie
    document.cookie = "token=; path=/; max-age=0";
    router.push("/login");
  };

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error?.message,
    logout,
    getToken,
  };
}
