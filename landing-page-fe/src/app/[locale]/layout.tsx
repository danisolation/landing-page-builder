import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { Toaster } from "sonner";
import { Inter, Poppins, Playfair_Display, Roboto } from "next/font/google";
import { routing } from "@/i18n/routing";
import AppLayout from "@/components/layout/AppLayout";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import QueryProvider from "@/providers/QueryProvider";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

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
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} ${roboto.variable} ${poppins.variable} ${playfair.variable}`}
    >
      <body>
        {/* Gate for scroll-reveal animations — content stays visible without JS */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
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

