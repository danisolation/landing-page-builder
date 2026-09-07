import "./globals.css";

// Pass-through root layout — <html> lives in [locale]/layout.tsx so `lang`
// matches the active locale. All routes sit under [locale] (middleware
// redirects bare `/` to the default locale).
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
