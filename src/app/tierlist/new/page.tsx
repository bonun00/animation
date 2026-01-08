import TierBoard from "@/components/TierBoard";

export default function NewTierListPage() {
    return (
        <main className="min-h-screen p-6">
            <div className="mx-auto max-w-6xl space-y-4">
                <h1 className="text-2xl font-bold">애니 티어리스트 만들기</h1>
                <p className="text-sm text-neutral-600">
                    애니를 검색해서 POOL에 추가하고, 티어(S~D)로 옮긴 뒤 한 줄 리뷰를 남겨봐.
                </p>
                <TierBoard />
            </div>
        </main>
    );
}