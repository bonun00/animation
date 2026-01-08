import { ANIME_LIST } from "@/lib/animeData";

export default function SearchPage() {
    return (
        <main className="min-h-screen p-6">
            <div className="mx-auto max-w-3xl space-y-4">
                <h1 className="text-2xl font-bold">애니 검색</h1>
                <p className="text-sm text-neutral-600">
                    (MVP) 일단 목록을 보여주는 페이지야. 실제 검색 UI는 티어표 페이지 왼쪽에 포함돼 있어.
                </p>

                <div className="space-y-2">
                    {ANIME_LIST.map((a) => (
                        <div key={a.id} className="rounded-lg border px-4 py-3">
                            <div className="font-semibold">{a.title}</div>
                            <div className="text-sm text-neutral-600">
                                {a.year ? `${a.year}` : ""} {a.genres?.length ? `· ${a.genres.join(", ")}` : ""}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}