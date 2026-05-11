import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://photoclinic-quote.vercel.app"),
  title: "포토클리닉 견적서 생성기",
  description: "병원 전문 브랜드 촬영 견적서를 자동으로 생성합니다.",
  openGraph: {
    title: "포토클리닉 견적서 생성기",
    description: "병원 전문 브랜드 촬영 견적서를 자동으로 생성합니다.",
    url: "https://photoclinic-quote.vercel.app",
    siteName: "포토클리닉",
    images: [
      {
        url: "/photoclinic-og.png",
        width: 1200,
        height: 630,
        alt: "포토클리닉 로고"
      }
    ],
    locale: "ko_KR",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "포토클리닉 견적서 생성기",
    description: "병원 전문 브랜드 촬영 견적서를 자동으로 생성합니다.",
    images: ["/photoclinic-og.png"]
  },
  icons: {
    icon: "/photoclinic-og.png",
    shortcut: "/photoclinic-og.png",
    apple: "/photoclinic-og.png"
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
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
