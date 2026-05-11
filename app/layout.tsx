import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://photoclinic-quote.vercel.app"),
  title: "포토클리닉 견적서 자동 생성",
  description:
    "포토클리닉 관리자용 촬영 견적서 자동 계산 및 PDF 다운로드 웹 프로그램입니다.",
  robots: {
    index: false,
    follow: false
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
