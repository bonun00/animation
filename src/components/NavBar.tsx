"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
    // 백엔드 연결 전 UI 테스트를 위한 가짜 상태 (클릭하면 로그인/로그아웃 바뀜)
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

            {/* 1. 로고 & 메인 메뉴 */}
            <div className="flex items-center gap-8">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-lg font-bold text-white">
        T
        </div>
        <span className="text-lg font-bold tracking-tight text-neutral-900">
        TierList
        </span>
        </Link>

    {/* 데스크탑 메뉴 링크 */}
    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
    <Link href="/search" className="transition hover:text-black">
        애니 검색
    </Link>
    <Link href="/tierlist/new" className="transition hover:text-black">
        티어 만들기
    </Link>
    <Link href="/community" className="transition hover:text-black">
        커뮤니티
        </Link>
    {isLoggedIn && (
        <Link href="/my" className="transition hover:text-black">
        내 정보
    </Link>
    )}
    </nav>
    </div>

    {/* 2. 우측 로그인/유저 정보 */}
    <div className="flex items-center gap-4">
        {isLoggedIn ? (
                // 로그인 상태일 때 (유저 프로필 + 알림)
                <div className="flex items-center gap-3">
                <button className="text-neutral-500 hover:text-black">
                    {/* 알림 아이콘 (Bell) */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                </button>

    {/* 유저 드롭다운 (클릭 시 로그아웃 테스트) */}
    <button
        onClick={() => setIsLoggedIn(false)}
    className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white p-1 pr-3 transition hover:bg-neutral-50"
    >
    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500" />
    <span className="text-xs font-bold text-neutral-700">애니덕후</span>
        </button>
        </div>
) : (
        // 로그아웃 상태일 때 (로그인 버튼)
        <div className="flex items-center gap-3">
        <button
            onClick={() => setIsLoggedIn(true)} // 테스트용: 클릭하면 로그인 됨
    className="text-sm font-medium text-neutral-500 hover:text-black"
        >
        로그인
        </button>
        <button
    onClick={() => setIsLoggedIn(true)}
    className="rounded-full bg-black px-4 py-2 text-sm font-bold text-white transition hover:bg-neutral-800"
        >
        시작하기
        </button>
        </div>
)}
    </div>
    </div>
    </header>
);
}