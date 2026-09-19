"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // staleTime 0: editor/admin luôn thấy dữ liệu mới nhất khi mở lại —
            // cache 60s làm sửa đổi vừa lưu "biến mất" khi mở lại trong 1 phút.
            staleTime: 0,
            // Giữ false: refetch khi focus có thể đè lên sửa đổi chưa lưu trong editor
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
