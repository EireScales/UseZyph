import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zyph",
  description: "Zyph app",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  
  );
}
