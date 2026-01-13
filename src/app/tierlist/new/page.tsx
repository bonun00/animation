import TierBoard from "@/components/tierboard/TierMain";

export default function NewTierListPage() {
    return (
        <main className="relative min-h-screen w-full bg-white selection:bg-black selection:text-white">
            <div className="relative mx-auto max-w-[1800px]">
                <div className="px-4 md:px-6 pb-20">
                    <TierBoard/>
                </div>
            </div>
        </main>
    );
}