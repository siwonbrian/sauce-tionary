import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { LanguageProvider } from "@/lib/LanguageContext";

export const metadata: Metadata = {
  title: "소스백과 (Sauce-tionary)",
  description: "유행하는 소스·양념 레시피를 한 곳에서 검색하고 저장하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <LanguageProvider>
          {children}
          <BottomNav />
        </LanguageProvider>
      </body>
    </html>
  );
}
