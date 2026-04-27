import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "AI Stylist | Yoora Sarah",
  description:
    "AI Stylist Yoora Sarah menggabungkan chat stylist, outfit composer, dan image understanding dalam satu panel premium.",
};

export default function StylistLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
