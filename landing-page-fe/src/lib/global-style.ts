import type { CSSProperties } from "react";
import type { PageGlobalStyle } from "@/types";

// Font stacks for the StylePanel font picker — each key is loaded in the
// root layout via next/font and exposed as a CSS variable.
export const fontStacks: Record<string, string> = {
  inter: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  roboto: "var(--font-roboto), ui-sans-serif, system-ui, sans-serif",
  poppins: "var(--font-poppins), ui-sans-serif, system-ui, sans-serif",
  playfair: "var(--font-playfair), Georgia, serif",
};

// Defaults mirror the hardcoded Tailwind blues so pages without
// globalStyle render exactly as before.
export const defaultGlobalStyle: Required<PageGlobalStyle> = {
  primaryColor: "#2563eb",
  fontFamily: "inter",
  sectionSpacing: 80,
  contentWidth: 1152,
};

// Maps Page.globalStyle → inline CSS custom properties applied on the page
// root (editor canvas and public page). Section components read these via
// var(--lp-*) utilities.
export function pageStyleVars(style?: PageGlobalStyle): CSSProperties {
  const merged = { ...defaultGlobalStyle, ...style };
  return {
    "--lp-primary": merged.primaryColor,
    "--lp-spacing": `${merged.sectionSpacing}px`,
    "--lp-width": `${merged.contentWidth}px`,
  } as CSSProperties;
}
