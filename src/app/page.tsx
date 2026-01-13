"use client";

import Link from "next/link";
import { useState } from "react";
import { ANIME_LIST } from "@/lib/animeData"; // 데이터 경로 확인해주세요
import { Anime } from "@/lib/types";
import NavBar from "@/components/NavBar";
// ---------------------------------------------------------
// 1. 리뷰 아이템 컴포넌트 (UI)
// ---------------------------------------------------------
function ReviewItem({ user, rating, text, date }: { user: string, rating: string, text: string, date: string }) {
    return (
        <div className="flex gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-600">
                {user[0]}
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-neutral-900">{user}</span>
                    <span className="rounded bg-black px-1.5 py-0.5 text-[10px] font-bold text-white">
            {rating}
          </span>
                    <span className="text-xs text-neutral-400">{date}</span>
                </div>
                <p className="text-sm text-neutral-700 leading-snug">{text}</p>
            </div>
        </div>
    );
}

// ---------------------------------------------------------
// 2. 애니 상세 모달 (팝업)
// ---------------------------------------------------------
function AnimeDetailModal({
                              anime,
                              onClose,
                          }: {
    anime: Anime;
    onClose: () => void;
}) {
    // 모달 바깥 클릭 시 닫기 방지 (이벤트 버블링 중단)
    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                onClick={handleContentClick}
                className="relative grid max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-[320px_1fr]"
            >

                {/* 왼쪽: 포스터 영역 */}
                <div className="relative bg-neutral-900 flex flex-col justify-end p-6">
                    {/* 실제 구현시: <Image src={anime.imageUrl} fill alt={anime.title} className="object-cover opacity-60" /> */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90 z-10"/>

                    {/* 포스터 플레이스홀더 */}
                    <div className="absolute inset-0 flex items-center justify-center text-neutral-700 font-bold text-6xl opacity-20 select-none">
                        IMG
                    </div>

                    <div className="relative z-20">
                        <h2 className="text-3xl font-black text-white leading-tight mb-2">
                            {anime.title}
                        </h2>
                        <div className="flex flex-wrap gap-2 text-xs text-white/70">
                            <span className="border border-white/20 px-2 py-0.5 rounded-full">{anime.year}</span>
                            {anime.genres?.map(g => (
                                <span key={g} className="bg-white/10 px-2 py-0.5 rounded-full">{g}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 오른쪽: 정보 및 리뷰 영역 */}
                <div className="flex flex-col h-full overflow-hidden bg-white">
                    {/* 헤더 (닫기 버튼) */}
                    <div className="flex items-center justify-between border-b px-6 py-4">
                        <h3 className="font-bold text-neutral-900">상세 정보</h3>
                        <button
                            onClick={onClose}
                            className="rounded-full bg-neutral-100 p-2 text-neutral-500 hover:bg-neutral-200 transition"
                        >
                            ✕
                        </button>
                    </div>

                    {/* 스크롤 가능한 컨텐츠 */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">

                        {/* 줄거리 */}
                        <div className="mb-8">
                            <h4 className="mb-2 text-sm font-bold text-neutral-900">줄거리</h4>
                            <p className="text-sm leading-relaxed text-neutral-600">
                                인류를 위협하는 괴물들과 맞서 싸우는 주인공의 처절한 사투를 그린 애니메이션.
                                절망적인 상황 속에서도 희망을 잃지 않는 인간들의 모습이 인상적이다.
                                (※ 실제 줄거리 데이터가 연결되면 이곳에 표시됩니다.)
                            </p>
                        </div>

                        {/* 리뷰 섹션 */}
                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <h4 className="text-sm font-bold text-neutral-900">
                                    유저 리뷰 <span className="text-red-500">(3)</span>
                                </h4>
                                <button className="text-xs font-semibold text-blue-600 hover:underline">
                                    + 리뷰 작성하기
                                </button>
                            </div>

                            <div className="space-y-3">
                                <ReviewItem
                                    user="애니조아"
                                    rating="S"
                                    text="올해 본 것 중에 최고였습니다. 작화팀 영혼 갈아넣음."
                                    date="2024.01.08"
                                />
                                <ReviewItem
                                    user="비평가K"
                                    rating="B"
                                    text="초반 전개는 좋았는데 후반부가 약간 아쉽네요."
                                    date="2023.12.20"
                                />
                                <ReviewItem
                                    user="NewBie"
                                    rating="A"
                                    text="입문작으로 추천합니다!"
                                    date="2023.11.05"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 하단 액션 버튼 (티어리스트 추가 등) */}
                    <div className="border-t p-4 bg-neutral-50">
                        <Link href="/tierlist/new" className="flex w-full items-center justify-center rounded-xl bg-neutral-900 py-3 text-sm font-bold text-white hover:bg-neutral-800 transition">
                            이 애니 내 티어리스트에 추가하기
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function HomePage() {
    const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);



    return (
        <main className="min-h-screen bg-white pb-20">

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-neutral-50 px-6 py-24 text-center">
                <div className="mx-auto max-w-3xl relative z-10">
                    <div className="mb-6 inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600 shadow-sm">
                        ✨ 나만의 애니 기록소 v0.1
                    </div>
                    <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-6xl">
                        애니메이션 취향,<br />
                        <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
              티어(Tier)
            </span>로 증명하세요.
                    </h1>
                    <p className="mb-8 text-lg text-neutral-500">
                        복잡한 평점은 그만. 직관적인 드래그 앤 드롭으로<br className="hidden sm:block" />
                        나만의 명예의 전당을 만들고 친구에게 자랑하세요.
                    </p>

                    <div className="flex items-center justify-center gap-4">
                        <Link
                            href="/tierlist/new"
                            className="rounded-xl bg-neutral-900 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-neutral-500/20 transition hover:-translate-y-0.5 hover:bg-neutral-800"
                        >
                            티어리스트 만들기
                        </Link>
                        <Link
                            href="/search"
                            className="rounded-xl border border-neutral-200 bg-white px-8 py-3.5 text-sm font-bold text-neutral-700 transition hover:-translate-y-0.5 hover:bg-neutral-50"
                        >
                            애니 검색
                        </Link>
                    </div>
                </div>

                {/* 배경 장식 (선택사항) */}
                <div className="absolute top-0 left-0 -z-0 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />
            </section>

            {/* Footer List Section */}
            <section className="mx-auto max-w-7xl px-6 py-12">
                <div className="mb-8 flex items-end justify-between border-b border-neutral-200 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900">🔥 Trending Now</h2>
                        <p className="mt-1 text-sm text-neutral-500">지금 가장 핫한 애니메이션 리뷰를 확인하세요.</p>
                    </div>
                    <Link href="/search" className="text-sm font-semibold text-neutral-500 hover:text-black">
                        전체보기 →
                    </Link>
                </div>

                {/* 그리드 리스트 */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {ANIME_LIST.map((anime) => (
                        <div
                            key={anime.id}
                            onClick={() => setSelectedAnime(anime)}
                            className="group cursor-pointer"
                        >
                            <div className="relative mb-3 aspect-[2/3] overflow-hidden rounded-xl bg-neutral-100 shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                                {/* 이미지 플레이스홀더 */}
                                <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-neutral-400 group-hover:bg-neutral-800 group-hover:text-white transition-colors">
                                    <span className="font-bold text-xs">{anime.title}</span>
                                </div>

                                {/* 호버 시 리뷰 보기 버튼 느낌 */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                    <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-white border border-white/30">
                        상세보기
                    </span>
                                </div>
                            </div>

                            <h3 className="truncate text-sm font-bold text-neutral-900 group-hover:text-red-600 transition-colors">
                                {anime.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                                <span>{anime.year}</span>
                                <span>·</span>
                                <span>{anime.genres?.[0]}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. 모달 렌더링 */}
            {selectedAnime && (
                <AnimeDetailModal
                    anime={selectedAnime}
                    onClose={() => setSelectedAnime(null)}
                />
            )}
        </main>
    );
}