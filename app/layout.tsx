import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gönül Köprüsü",
  description: "Aziz Mahmud Hüdayi Vakfı Bağışçı Portalı",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}