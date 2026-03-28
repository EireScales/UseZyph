import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Pricing — Zyph",
  description:
    "Your AI that actually knows you. Simple pricing: Free to start, or Pro with unlimited captures and full history.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${dmSans.className} min-h-screen antialiased`}>
      {children}
    </div>
  );
}
