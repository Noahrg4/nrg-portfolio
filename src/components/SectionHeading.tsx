import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

// Plain h2. The prior framer-motion clip-path reveal silently hid headings
// when whileInView's IntersectionObserver didn't fire (notably the CTA band
// heading inside an overflow-hidden parent). A CSS-keyframe replacement had
// its own failure modes (animation pinned at start frame in some renderers).
// Visibility now does not depend on any animation completing.
export default function SectionHeading({ children, className = "" }: Props) {
  return <h2 className={className}>{children}</h2>;
}
