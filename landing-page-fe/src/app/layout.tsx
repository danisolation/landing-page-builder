import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import AppLayout from "@/components/layout/AppLayout";
import ToastNotification from "@/components/ui/toast-notification";
import ConfirmDialog from "@/components/ui/confirm-dialog";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Landing Page Builder",
  description: "Build landing pages easily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AppLayout>
            {children}
          </AppLayout>
          <ToastNotification />
          <ConfirmDialog />
        </QueryProvider>
      </body>
    </html>
  );
}
