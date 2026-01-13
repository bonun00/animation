// src/app/layout.tsx
import "./globals.css";
import Navbar from "@/components/NavBar"; // 방금 만든 컴포넌트 import

export const metadata = {
    title: "Anime TierList",
    description: "나만의 애니메이션 티어리스트 만들기",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
        <body className="bg-white text-neutral-900 antialiased">
        <Navbar />

        {children}
        </body>
        </html>
    );
}