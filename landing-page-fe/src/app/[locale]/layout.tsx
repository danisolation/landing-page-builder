import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import "../globals.css";

export const metadata = {
  title: "Landing Page Builder",
  description: "Build landing pages easily",
};

// Shared shell for admin routes [(admin)/*] and public landing pages
// [(public)/*]. Admin chrome (AppLayout, providers) lives in (admin)/layout.
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Public slugs (/home, /pricing) also flow through here as the dynamic
  // param — only real locales get a lang attribute.
  const lang = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;

  return (
    <html lang={lang} suppressHydrationWarning className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
