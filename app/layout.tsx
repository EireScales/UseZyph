import type { Metadata } from "next";
import "./globals.css";

export const revalidate = 0;

export const metadata: Metadata = {
  metadataBase: new URL("https://www.usezyph.com"),
  title: "Zyph",
  description: "Zyph app",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="shortcut icon" href="/favicon-32x32.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  
  );
}
