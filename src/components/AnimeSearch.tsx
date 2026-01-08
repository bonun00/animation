"use client";

import { useMemo, useState } from "react";
import { Anime } from "@/lib/types";

type Props = {
    animeList: Anime[];
    selectedIds: Set<string>;
    onAdd: (animeId: string) => void;
};

export default function AnimeSearch({ animeList, selectedIds, onAdd }: Props) {
    const [q, setQ] = useState("");

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();
        if (!query) return animeList;
        return animeList.filter((a) => a.title.toLowerCase().includes(query));
    }, [q, animeList]);

    return (
        <section className="rounded-xl border p-4">
            <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                    <h2 className="text-base font-semibold">애니 검색</h2>
                    <p className="text-xs text-neutral-600">
                        검색해서 “후보(POOL)”에 추가한 뒤 티어를 매겨.
                    </p>
                </div>
                <div className="text-xs text-neutral-600">
                    선택됨: <span className="font-semibold">{selectedIds.size}</span>
                </div>
            </div>

            <input
                className="mb-3 w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="예: 프리렌, 진격..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
            />

            <div className="max-h-[360px] space-y-2 overflow-auto pr-1">
                {filtered.map((a) => {
                    const disabled = selectedIds.has(a.id);
                    return (
                        <div
                            key={a.id}
                            className="flex items-center justify-between rounded-lg border px-3 py-2"
                        >
                            <div className="min-w-0">
                                <div className="truncate font-medium">{a.title}</div>
                                <div className="text-xs text-neutral-600">
                                    {a.year ? `${a.year}` : ""}{" "}
                                    {a.genres?.length ? `· ${a.genres.join(", ")}` : ""}
                                </div>
                            </div>

                            <button
                                className="ml-3 shrink-0 rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                                disabled={disabled}
                                onClick={() => onAdd(a.id)}
                            >
                                {disabled ? "추가됨" : "추가"}
                            </button>
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <div className="rounded-lg border p-3 text-sm text-neutral-600">
                        검색 결과가 없어.
                    </div>
                )}
            </div>
        </section>
    );
}