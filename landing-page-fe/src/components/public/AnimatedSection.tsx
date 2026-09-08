export interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

// Reveal-on-scroll is handled purely in CSS (animation-timeline: view()) on the
// .reveal class — content renders visible in the SSR HTML, no JS involved.
export default function AnimatedSection({ children, className = '' }: AnimatedSectionProps) {
  return <div className={`reveal ${className}`}>{children}</div>;
}
