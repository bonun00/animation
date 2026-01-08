"use client";

import { useEffect, useMemo, useState } from "react";
import AnimeSearch from "@/components/AnimeSearch";
import { ANIME_LIST } from "@/lib/animeData";
import { Anime, Tier, TierState } from "@/lib/types";

import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    closestCenter,
    useDroppable,
    useSensor,
    useSensors,
} from "@dnd-kit/core";

import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

const TIERS: Tier[] = ["S", "A", "B", "C", "D"];
type ContainerId = "POOL" | Tier;

const STORAGE_KEY = "anime-tierlist:pyramid:v1";

function createEmptyState(): TierState {
    return { pool: [], tiers: { S: [], A: [], B: [], C: [], D: [] } };
}

function uniq(arr: string[]) {
    return Array.from(new Set(arr));
}

function tierStyle(t: ContainerId) {
    if (t === "POOL") return "border-neutral-200 bg-red-00";
    if (t === "S") return "border-emerald-200 bg-red-300";
    if (t === "A") return "border-sky-200 bg-orange-200";
    if (t === "B") return "border-amber-200 bg-yellow-200";
    if (t === "C") return "border-orange-200 bg-emerald-200";
    return "border-rose-200 bg-rose-50";
}

function findContainerOf(state: TierState, animeId: string): ContainerId | null {
    if (state.pool.includes(animeId)) return "POOL";
    for (const t of TIERS) if (state.tiers[t].includes(animeId)) return t;
    return null;
}

function getItems(state: TierState, c: ContainerId) {
    return c === "POOL" ? state.pool : state.tiers[c];
}

function setItems(state: TierState, c: ContainerId, nextIds: string[]): TierState {
    if (c === "POOL") return { ...state, pool: nextIds };
    return { ...state, tiers: { ...state.tiers, [c]: nextIds } };
}

function removeFromAll(state: TierState, animeId: string): TierState {
    return {
        pool: state.pool.filter((id) => id !== animeId),
        tiers: {
            S: state.tiers.S.filter((id) => id !== animeId),
            A: state.tiers.A.filter((id) => id !== animeId),
            B: state.tiers.B.filter((id) => id !== animeId),
            C: state.tiers.C.filter((id) => id !== animeId),
            D: state.tiers.D.filter((id) => id !== animeId),
        },
    };
}

function DraggableCard({ anime, note }: { anime: Anime; note?: string }) {
    return (
        <div className="rounded-2xl border bg-white px-3 py-3 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="truncate font-semibold">{anime.title}</div>
                    <div className="mt-0.5 text-xs text-neutral-600">
                        {anime.year ? `${anime.year}` : ""}{" "}
                        {anime.genres?.length ? `· ${anime.genres.join(", ")}` : ""}
                    </div>
                </div>
                <span className="shrink-0 rounded-full border px-2 py-0.5 text-[11px] text-neutral-600">
          Drag
        </span>
            </div>

            {note?.trim() ? (
                <div className="mt-2 line-clamp-2 text-sm text-neutral-700">
                    “{note}”
                </div>
            ) : null}
        </div>
    );
}

function SortableAnimeItem({
                               anime,
                               id,
                               note,
                           }: {
    anime: Anime;
    id: string;
    note?: string;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    } as React.CSSProperties;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={isDragging ? "opacity-40" : ""}
            {...attributes}
            {...listeners}
        >
            <DraggableCard anime={anime} note={note} />
        </div>
    );
}

function DroppableContainer({
                                id,
                                children,
                            }: {
    id: ContainerId;
    children: React.ReactNode;
}) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <div
            ref={setNodeRef}
            className={isOver ? "rounded-2xl ring-2 ring-black/10 transition" : "transition"}
        >
            {children}
        </div>
    );
}

function Column({
                    title,
                    containerId,
                    ids,
                    animeById,
                    noteById,
                    onEditNote,
                }: {
    title: string;
    containerId: ContainerId;
    ids: string[];
    animeById: Map<string, Anime>;
    noteById: Record<string, string>;
    onEditNote: (animeId: string, text: string) => void;
}) {
    return (
        <section className={`rounded-2xl border p-4 ${tierStyle(containerId)}`}>
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold tracking-tight">{title}</h2>
                <span className="rounded-full border bg-white/70 px-2 py-0.5 text-xs text-neutral-700">
          {ids.length}
        </span>
            </div>

            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                    {ids.length === 0 ? (
                        <div className="rounded-xl border bg-white/60 p-3 text-sm text-neutral-600">
                            여기에 드래그해서 놓기
                        </div>
                    ) : (
                        ids.map((animeId) => {
                            const a = animeById.get(animeId);
                            if (!a) return null;
                            return (
                                <div key={animeId} className="space-y-2">
                                    <SortableAnimeItem id={animeId} anime={a} note={noteById[animeId]} />
                                    <input
                                        className="w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                                        placeholder="한 줄 리뷰(선택) 예: 전개 느리지만 여운이 큼"
                                        value={noteById[animeId] ?? ""}
                                        onChange={(e) => onEditNote(animeId, e.target.value)}
                                    />
                                </div>
                            );
                        })
                    )}
                </div>
            </SortableContext>
        </section>
    );
}

export default function TierBoard() {
    const animeById = useMemo(() => {
        const m = new Map<string, Anime>();
        ANIME_LIST.forEach((a) => m.set(a.id, a));
        return m;
    }, []);

    const [state, setState] = useState<TierState>(() => createEmptyState());
    const [noteById, setNoteById] = useState<Record<string, string>>({});
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
    );

    // load
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw) as {
                state: TierState;
                noteById: Record<string, string>;
            };
            if (parsed?.state?.tiers) setState(parsed.state);
            if (parsed?.noteById) setNoteById(parsed.noteById);
        } catch {}
    }, []);

    // save
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, noteById }));
        } catch {}
    }, [state, noteById]);

    const selectedIds = useMemo(() => {
        const all = [state.pool, ...TIERS.map((t) => state.tiers[t])].flat();
        return new Set(all);
    }, [state]);

    const addToPool = (animeId: string) => {
        setState((prev) => {
            if (findContainerOf(prev, animeId)) return prev;
            return { ...prev, pool: uniq([animeId, ...prev.pool]) };
        });
    };

    const resetAll = () => {
        setState(createEmptyState());
        setNoteById({});
        localStorage.removeItem(STORAGE_KEY);
    };

    const onEditNote = (animeId: string, text: string) => {
        setNoteById((prev) => ({ ...prev, [animeId]: text }));
    };

    const handleDragStart = (e: DragStartEvent) => {
        setActiveId(String(e.active.id));
    };

    const handleDragEnd = (e: DragEndEvent) => {
        const aId = String(e.active.id);
        const oId = e.over?.id ? String(e.over.id) : null;
        setActiveId(null);
        if (!oId) return;

        const from = findContainerOf(state, aId);
        if (!from) return;

        const overIsContainer = oId === "POOL" || (TIERS as string[]).includes(oId);
        const to: ContainerId | null = overIsContainer
            ? (oId as ContainerId)
            : findContainerOf(state, oId);

        if (!to) return;

        // 같은 컨테이너에서 아이템 위로 드롭 => 정렬 변경
        if (from === to && !overIsContainer) {
            const items = getItems(state, from);
            const oldIndex = items.indexOf(aId);
            const newIndex = items.indexOf(oId);
            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                const moved = arrayMove(items, oldIndex, newIndex);
                setState((prev) => setItems(prev, from, moved));
            }
            return;
        }

        // 다른 컨테이너로 이동
        setState((prev) => {
            const cleaned = removeFromAll(prev, aId);
            const toItems = getItems(cleaned, to);

            // 아이템 위로 drop => 그 위치에 삽입
            if (!overIsContainer) {
                const idx = toItems.indexOf(oId);
                const insertAt = idx === -1 ? 0 : idx;
                const next = [
                    ...toItems.slice(0, insertAt),
                    aId,
                    ...toItems.slice(insertAt),
                ];
                return setItems(cleaned, to, uniq(next));
            }

            // 컨테이너 위 drop => 맨 앞에
            return setItems(cleaned, to, uniq([aId, ...toItems]));
        });
    };

    const activeAnime = activeId ? animeById.get(activeId) : null;

    return (
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            {/* Left */}
            <div className="space-y-4">
                <AnimeSearch animeList={ANIME_LIST} selectedIds={selectedIds} onAdd={addToPool} />

                <div className="rounded-2xl border bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-semibold">내 티어리스트</div>
                            <div className="text-xs text-neutral-600">
                                카드 드래그로 S~D / POOL 이동 + 같은 칸 안 정렬
                            </div>
                        </div>
                        <button
                            className="rounded-xl border px-3 py-1.5 text-sm hover:bg-neutral-50"
                            onClick={resetAll}
                        >
                            초기화
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: Pyramid Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="space-y-4">
                    {/* S (좁게) */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-xl">
                            <DroppableContainer id="S">
                                <Column
                                    title="S 티어"
                                    containerId="S"
                                    ids={state.tiers.S}
                                    animeById={animeById}
                                    noteById={noteById}
                                    onEditNote={onEditNote}
                                />
                            </DroppableContainer>
                        </div>
                    </div>

                    {/* A */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-2xl">
                            <DroppableContainer id="A">
                                <Column
                                    title="A 티어"
                                    containerId="A"
                                    ids={state.tiers.A}
                                    animeById={animeById}
                                    noteById={noteById}
                                    onEditNote={onEditNote}
                                />
                            </DroppableContainer>
                        </div>
                    </div>

                    {/* B */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-3xl">
                            <DroppableContainer id="B">
                                <Column
                                    title="B 티어"
                                    containerId="B"
                                    ids={state.tiers.B}
                                    animeById={animeById}
                                    noteById={noteById}
                                    onEditNote={onEditNote}
                                />
                            </DroppableContainer>
                        </div>
                    </div>

                    {/* C */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-4xl">
                            <DroppableContainer id="C">
                                <Column
                                    title="C 티어"
                                    containerId="C"
                                    ids={state.tiers.C}
                                    animeById={animeById}
                                    noteById={noteById}
                                    onEditNote={onEditNote}
                                />
                            </DroppableContainer>
                        </div>
                    </div>

                    {/* D */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-5xl">
                            <DroppableContainer id="D">
                                <Column
                                    title="D 티어"
                                    containerId="D"
                                    ids={state.tiers.D}
                                    animeById={animeById}
                                    noteById={noteById}
                                    onEditNote={onEditNote}
                                />
                            </DroppableContainer>
                        </div>
                    </div>

                    {/* POOL (가장 넓게) */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-6xl">
                            <DroppableContainer id="POOL">
                                <Column
                                    title="POOL"
                                    containerId="POOL"
                                    ids={state.pool}
                                    animeById={animeById}
                                    noteById={noteById}
                                    onEditNote={onEditNote}
                                />
                            </DroppableContainer>
                        </div>
                    </div>
                </div>

                <DragOverlay>
                    {activeAnime ? (
                        <div className="w-[320px]">
                            <DraggableCard anime={activeAnime} note={noteById[activeAnime.id]} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}