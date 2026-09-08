import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { Toaster } from "sonner";
import { routing } from "@/i18n/routing";
import AppLayout from "@/components/layout/AppLayout";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import QueryProvider from "@/providers/QueryProvider";
import { fontVariables } from "@/lib/fonts";
import "../globals.css";

export const metadata = {
  title: "Landing Page Builder",
  description: "Build landing pages easily",
};

export default async function LocaleLayout({
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
    // Font variables live on <html> so the font-sans token resolves there
    // (body-level variables would leave html's font-sans unresolvable).
    <html lang={locale} suppressHydrationWarning className={fontVariables}>
      <body>
        <QueryProvider>
          <NextIntlClientProvider messages={messages}>
            <AppLayout>{children}</AppLayout>
            <Toaster position="top-right" richColors />
            <ConfirmDialog />
          </NextIntlClientProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

