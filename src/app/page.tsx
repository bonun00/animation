import Link from "next/link";

export default function HomePage() {
    return (
        <main className="min-h-screen p-6">
            <div className="mx-auto max-w-3xl space-y-4">
                <h1 className="text-3xl font-bold">Anime Tier</h1>
                <p className="text-sm text-neutral-600">
                    애니를 검색하고 티어리스트를 만들어 공유하는 MVP.
                </p>

                <div className="flex gap-3">
                    <Link className="rounded-lg bg-black px-4 py-2 text-white" href="/tierlist/new">
                        티어리스트 만들기
                    </Link>
                    <Link className="rounded-lg border px-4 py-2" href="/search">
                        애니 검색
                    </Link>
                </div>
            </div>
        </main>
    );
}