export type Anime = {
    id: string;
    title: string;
    year?: number;
    genres?: string[];
    imageUrl?: string;
};

export type Tier = "S" | "A" | "B" | "C" | "D";

export type TierState = {
    pool: string[]; // 티어 미배정(후보)
    tiers: Record<Tier, string[]>; // 티어별 animeId 배열
};