import "../globals.css";
import { fontVariables } from "@/lib/fonts";

// Public landing pages ([slug]) don't pass through [locale]/layout, so the
// font CSS variables must be applied here for fontStacks to resolve.
export default function SlugLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className={fontVariables}>{children}</div>;
}
