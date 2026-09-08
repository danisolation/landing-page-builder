import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { Toaster } from "sonner";
import { routing } from "@/i18n/routing";
import AppLayout from "@/components/layout/AppLayout";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import QueryProvider from "@/providers/QueryProvider";

// Admin chrome — public landing pages [(public)] deliberately bypass this
// layout so visitors don't download the app shell.
export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <QueryProvider>
      <NextIntlClientProvider messages={messages}>
        <AppLayout>{children}</AppLayout>
        <Toaster position="top-right" richColors />
        <ConfirmDialog />
      </NextIntlClientProvider>
    </QueryProvider>
  );
}
