import { Inter, Poppins, Playfair_Display, Roboto } from "next/font/google";

// Shared next/font declarations — used by the admin ([locale]) layout and the
// public ([slug]) layout so both expose the same CSS variables the font
// picker's fontStacks reference.
//
// Only Inter (the UI font) preloads. The other families exist solely for the
// per-page font picker; preloading them would ship every family to every
// visitor. With preload: false, @font-face is declared but the browser only
// downloads weights a page actually uses.
export const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  preload: false,
});
export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  preload: false,
});
export const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  preload: false,
});

export const fontVariables = `${inter.variable} ${roboto.variable} ${poppins.variable} ${playfair.variable}`;
