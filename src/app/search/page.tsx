"use client";

import { useMemo, useState } from "react";
import { ANIME_LIST } from "@/lib/animeData";

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGenre, setSelectedGenre] = useState("All");

    const allGenres = useMemo(() => {
        const genres = new Set<string>();
        ANIME_LIST.forEach((anime) => {
            anime.genres?.forEach((g) => genres.add(g));
        });
        return ["All", ...Array.from(genres).sort()];
    }, []);


    const filteredList = useMemo(() => {
        return ANIME_LIST.filter((anime) => {
            const matchGenre =
                selectedGenre === "All" || anime.genres?.includes(selectedGenre);

            const matchSearch =
                anime.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                anime.title.includes(searchQuery);
            return matchGenre && matchSearch;
        });
    }, [searchQuery, selectedGenre]);

    return (
        <main className="min-h-screen bg-white pb-20">
            <div className="mx-auto max-w-[1600px] px-4 py-8 md:px-8">

                {/* 헤더 영역 */}
                <div className="mb-8 space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                        애니 검색 ({filteredList.length})
                    </h1>

                    {/* 검색창 */}
                    <div className="relative max-w-md">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                            🔍
                        </div>
                        <input
                            type="text"
                            placeholder="제목으로 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-full border border-neutral-200 bg-neutral-50 py-3 pl-10 pr-4 text-sm font-medium focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                        />
                    </div>
                </div>

                {/* 카테고리 (장르) 필터 - 가로 스크롤 */}
                <div className="sticky top-16 z-10 -mx-4 mb-8 overflow-x-auto bg-white/95 px-4 py-4 backdrop-blur-sm md:-mx-8 md:px-8">
                    <div className="flex gap-2">
                        {allGenres.map((genre) => (
                            <button
                                key={genre}
                                onClick={() => setSelectedGenre(genre)}
                                className={`
                  shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all
                  ${selectedGenre === genre
                                    ? "bg-black text-white shadow-md"
                                    : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900"}
                `}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredList.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {filteredList.map((anime) => (
                            <div key={anime.id} className="group cursor-pointer">
                                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-neutral-100 shadow-sm transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
                                    <img
                                        src={anime.imageUrl } // 이미지가 없을 때 대비
                                        alt={anime.title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />

                                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                        <p className="text-[10px] font-bold text-white/80">{anime.year}</p>
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            {anime.genres?.slice(0, 2).map(g => (
                                                <span key={g} className="rounded bg-white/20 px-1.5 py-0.5 text-[9px] text-white backdrop-blur-md">
                                {g}
                            </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* 하단 텍스트 정보 */}
                                <div className="mt-3 px-1">
                                    <h3 className="line-clamp-1 text-sm font-bold text-neutral-900 group-hover:text-rose-500 transition-colors">
                                        {anime.title}
                                    </h3>
                                    <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">
                                        {anime.genres?.join(", ")}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (

                    <div className="flex h-60 flex-col items-center justify-center text-neutral-400">
                        <span className="text-4xl">🤔</span>
                        <p className="mt-4 text-sm font-medium">검색 결과가 없습니다.</p>
                        <button
                            onClick={() => {setSearchQuery(""); setSelectedGenre("All");}}
                            className="mt-2 text-xs text-blue-500 underline"
                        >
                            필터 초기화
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}