"use client";

import { useEffect, useMemo, useState } from "react";
import AnimeSearch from "@/components/AnimeSearch";
import { ANIME_LIST } from "@/lib/animeData";
import { Anime, Tier, TierState } from "@/lib/types";
import { createPortal } from "react-dom";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    TouchSensor,   // 중요: 모바일 터치 대응
    closestCenter,
    useDroppable,
    useSensor,
    useSensors,
    MeasuringStrategy
} from "@dnd-kit/core";

import {
    SortableContext,
    useSortable,
    rectSortingStrategy,
    arrayMove, horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

// ------------------------------------------------------------------
// 0. 설정 및 유틸
// ------------------------------------------------------------------
const TIERS: Tier[] = ["S", "A", "B", "C", "D"];
type ContainerId = "POOL" | Tier;
const STORAGE_KEY = "anime-tierlist:clean:v1";

function createEmptyState(): TierState {
    return { pool: [], tiers: { S: [], A: [], B: [], C: [], D: [] } };
}

function uniq(arr: string[]) {
    return Array.from(new Set(arr));
}

// ✨ 세련된 컬러 팔레트 (Tailwind)
const TIER_CONFIG: Record<Tier, { color: string; bg: string; label: string }> = {
    S: { color: "bg-rose-500", bg: "bg-rose-50", label: "Masterpiece" },
    A: { color: "bg-orange-400", bg: "bg-orange-50", label: "Excellent" },
    B: { color: "bg-amber-400", bg: "bg-amber-50", label: "Very Good" },
    C: { color: "bg-emerald-400", bg: "bg-emerald-50", label: "Average" },
    D: { color: "bg-slate-400", bg: "bg-slate-50", label: "Poor" },
};
function AnimeCard({
                       anime,
                       note,
                       onDoubleClick,
                       isOverlay = false,
                   }: {
    anime: Anime;
    note?: string;
    onDoubleClick?: () => void;
    isOverlay?: boolean;
}) {
    return (
        <div
            onDoubleClick={onDoubleClick}
            className={`
        group relative cursor-grab overflow-hidden rounded-lg bg-white transition-all
        /* 모바일: w-16 (작게), 데스크탑: w-24 (크게) */
        w-16 md:w-24 aspect-[2/3]
        ${isOverlay ? "scale-105 shadow-2xl ring-4 ring-black/10 z-50" : "shadow-sm border border-neutral-200"}
      `}
        >
            <div className="flex h-full w-full flex-col items-center justify-center bg-neutral-100 p-1 text-center group-hover:bg-neutral-800 transition-colors">
        <span className="line-clamp-2 text-[8px] md:text-[10px] font-bold text-neutral-500 group-hover:text-white leading-tight">
          {anime.title}
        </span>
            </div>
            {note?.trim() && (
                <div className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 ring-1 ring-white" />
            )}
        </div>
    );
}

function SortableItem({ id, anime, note, onEdit }: any) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Translate.toString(transform), // 핵심: Translate 사용
        transition,
        touchAction: 'none' // ✨ 추가: 드래그 중 화면 스크롤 방지 (필수)
    };

    if (isDragging) {
        // 드래그 중일 때 원래 자리에 남는 박스 (투명하게)
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="aspect-[2/3] w-16 rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-100 opacity-50 md:w-24"
            />
        );
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <AnimeCard anime={anime} note={note} onDoubleClick={() => onEdit(id)} />
        </div>
    );
}

function TierRow({ tier, ids, animeById, noteById, onEditNote }: any) {
    const config = TIER_CONFIG[tier as Tier];
    const { setNodeRef, isOver } = useDroppable({ id: tier });

    return (
        <div className="flex overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm">
            {/* 라벨: 모바일에서는 좁게(w-12), 데스크탑에선 넓게(w-24) */}
            <div className={`flex w-12 md:w-24 shrink-0 flex-col items-center justify-center ${config.bg} p-1 md:p-2`}>
                <span className={`text-xl md:text-3xl font-black ${config.color.replace('bg-', 'text-')}`}>{tier}</span>
                <span className="hidden md:block mt-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">{config.label}</span>
            </div>

            <div ref={setNodeRef} className={`flex min-h-[100px] md:min-h-[128px] flex-1 flex-wrap content-start items-start gap-2 p-2 md:p-4 transition-colors ${isOver ? "bg-neutral-50" : "bg-white"}`}>
                <SortableContext items={ids} strategy={rectSortingStrategy}>
                    {ids.map((id: string) => {
                        const anime = animeById.get(id);
                        if (!anime) return null;
                        return <SortableItem key={id} id={id} anime={anime} note={noteById[id]} onEdit={onEditNote} />;
                    })}
                </SortableContext>
                {ids.length === 0 && !isOver && (
                    <div className="flex w-full h-full min-h-[80px] items-center justify-center text-[10px] text-neutral-300">Drag Here</div>
                )}
            </div>
        </div>
    );
}

function ReviewModal({ anime, initialNote, onSave, onClose }: any) {
    const [text, setText] = useState(initialNote);
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                <h3 className="font-bold">{anime.title}</h3>
                <input autoFocus className="mt-4 w-full rounded border p-2 text-sm" value={text} onChange={e => setText(e.target.value)} />
                <div className="mt-4 flex justify-end gap-2">
                    <button onClick={onClose} className="px-3 py-2 text-xs">취소</button>
                    <button onClick={() => onSave(text)} className="rounded bg-black px-4 py-2 text-xs text-white">저장</button>
                </div>
            </div>
        </div>
    )
}

// ------------------------------------------------------------------
// 메인 페이지
// ------------------------------------------------------------------
export default function TierPage() {
    const animeById = useMemo(() => {
        const m = new Map<string, Anime>();
        ANIME_LIST.forEach((a) => m.set(a.id, a));
        return m;
    }, []);

    const [state, setState] = useState<TierState>(createEmptyState);
    const [noteById, setNoteById] = useState<Record<string, string>>({});
    const [activeId, setActiveId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    // 모바일: 검색창 열고 닫기
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // ✨ 센서 설정 (모바일 터치 최적화)
    // 터치 후 250ms 동안 5px 이상 움직이지 않아야 '드래그'로 인식 (스크롤과 구분)
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 250, tolerance: 5 },
        })
    );

    // Load/Save Logic (생략 - 이전과 동일)
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) { const p = JSON.parse(raw); setState(p.state || createEmptyState()); setNoteById(p.noteById || {}); }
        } catch {}
    }, []);
    useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, noteById })); }, [state, noteById]);

    // Actions (addToPool, resetAll 등 이전과 동일)
    const addToPool = (id: string) => {
        setState((prev) => {
            const all = [prev.pool, ...Object.values(prev.tiers)].flat();
            if(all.includes(id)) return prev;
            return { ...prev, pool: uniq([id, ...prev.pool]) };
        });
    };
    const resetAll = () => { if(confirm("초기화?")) { setState(createEmptyState()); setNoteById({}); } };

    // DnD Handlers (handleDragStart, handleDragEnd 이전과 동일)
    const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
    const handleDragEnd = (e: DragEndEvent) => {
        const { active, over } = e;
        setActiveId(null);
        if (!over) return;
        const aId = String(active.id);
        const oId = String(over.id);

        const findContainer = (id: string): ContainerId | undefined => {
            if(state.pool.includes(id)) return "POOL";
            if (id === 'POOL_DESKTOP' || id === 'POOL_MOBILE') return "POOL";
            if((TIERS as string[]).includes(id)) return id as Tier;
            if(id === 'POOL') return "POOL";
            return (Object.keys(state.tiers) as Tier[]).find(k => state.tiers[k].includes(id));
        };
        const activeContainer = findContainer(aId);
        const overContainer = findContainer(oId);
        if(!activeContainer || !overContainer) return;

        if(activeContainer === overContainer) {
            const items = activeContainer === 'POOL' ? state.pool : state.tiers[activeContainer];
            const oldIdx = items.indexOf(aId);
            const newIdx = items.indexOf(oId);
            if(oldIdx !== newIdx) {
                const newItems = arrayMove(items, oldIdx, newIdx);
                setState(prev => activeContainer === 'POOL' ? { ...prev, pool: newItems } : { ...prev, tiers: { ...prev.tiers, [activeContainer]: newItems } });
            }
        } else {
            setState(prev => {
                const source = activeContainer === 'POOL' ? prev.pool : prev.tiers[activeContainer];
                const dest = overContainer === 'POOL' ? prev.pool : prev.tiers[overContainer];
                const newSource = source.filter(id => id !== aId);
                const newDest = [...dest];
                const overIdx = dest.indexOf(oId);
                if(overIdx >= 0) newDest.splice(overIdx, 0, aId); else newDest.push(aId);

                const next = { ...prev };
                if(activeContainer === 'POOL') next.pool = newSource; else next.tiers = { ...next.tiers, [activeContainer]: newSource };
                if(overContainer === 'POOL') next.pool = newDest; else next.tiers = { ...next.tiers, [overContainer]: newDest };
                return next;
            });
        }
    };


    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const activeAnime = activeId ? animeById.get(activeId) : null;
    const { setNodeRef: setMobilePoolRef } = useDroppable({ id: 'POOL_MOBILE' });

    return (
        <div className="min-h-screen bg-neutral-50/50 pb-40 md:pb-20">
            {/* pb-40: 모바일 하단 Dock 때문에 여백 많이 줌 */}

            {/* 상단 툴바 */}
            <div className=" top-16 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 md:px-6 md:py-4">
                    <h2 className="text-sm md:text-base font-bold text-neutral-800">새 티어리스트</h2>
                    <div className="flex gap-2">
                        {/* 모바일에서만 보이는 검색 토글 버튼 */}
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="lg:hidden rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-bold"
                        >
                            {isSearchOpen ? "검색 닫기" : "🔍 애니 추가"}
                        </button>

                        <button onClick={resetAll} className="hidden md:block rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-400 hover:bg-neutral-100">초기화</button>
                        <button className="rounded-lg bg-black px-3 py-1.5 text-xs font-bold text-white shadow-lg">저장</button>
                    </div>
                </div>

                {/* 모바일용 검색창 (토글됨) */}
                {isSearchOpen && (
                    <div className="border-t bg-white p-4 lg:hidden animate-in slide-in-from-top-2">
                        <AnimeSearch animeList={ANIME_LIST} selectedIds={new Set([state.pool, ...Object.values(state.tiers)].flat())} onAdd={(id) => { addToPool(id); setIsSearchOpen(false); }} />
                    </div>
                )}
            </div>

            {/* 메인 레이아웃: 데스크탑 3단 / 모바일 1단 */}
            <div className="mx-auto grid max-w-[1600px] gap-6 px-4 py-6 lg:grid-cols-[460px_1fr] lg:px-6">

                {/* 1. 데스크탑 전용: 좌측 검색 (모바일엔 숨김) */}
                <div className="hidden lg:block space-y-6">
                    <div className=" top-32 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
                        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-500">Search</h3>
                        <AnimeSearch animeList={ANIME_LIST} selectedIds={new Set([state.pool, ...Object.values(state.tiers)].flat())} onAdd={addToPool} />
                    </div>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}>

                    {/* 3. 공통: 티어 보드 */}
                    <div className="space-y-3 md:space-y-4">
                        {TIERS.map(t => (
                            <TierRow key={t} tier={t} ids={state.tiers[t]} animeById={animeById} noteById={noteById} onEditNote={setEditingId} />
                        ))}
                    </div>

                    {/* ✨ 4. 모바일 전용: 하단 고정 Dock (대기열) */}
                    <div className=" fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white/90 backdrop-blur-xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-100">
                            <span className="text-xs font-bold text-neutral-500">대기 목록 ({state.pool.length})</span>
                            <span className="text-[10px] text-neutral-400">가로로 스크롤하세요 →</span>
                        </div>

                        {/* 여기가 진짜 대기열 드롭존 */}
                        <div ref={setMobilePoolRef} className="flex h-28 items-center gap-3 overflow-x-auto px-4 py-2 scrollbar-hide">
                            <SortableContext items={state.pool} strategy={horizontalListSortingStrategy}>
                                {state.pool.length === 0 ? (
                                    <div className="flex w-full justify-center text-xs text-neutral-400 py-4">
                                        👆 위 '검색' 버튼을 눌러 추가하세요
                                    </div>
                                ) : (
                                    state.pool.map(id => {
                                        const anime = animeById.get(id);
                                        if(!anime) return null;
                                        return <SortableItem key={id} id={id} anime={anime} note={noteById[id]} onEdit={setEditingId} />;
                                    })
                                )}
                            </SortableContext>
                        </div>
                    </div>

                    {mounted && createPortal(
                        <DragOverlay>
                            {activeAnime ? (
                                <AnimeCard
                                    anime={activeAnime}
                                    note={noteById[activeAnime.id]}
                                    isOverlay
                                />
                            ) : null}
                        </DragOverlay>,
                        document.body
                    )}

                </DndContext>
            </div>

            {editingId && (
                <ReviewModal anime={animeById.get(editingId)} initialNote={noteById[editingId] || ""} onClose={() => setEditingId(null)} onSave={(t: string) => { setNoteById(prev => ({...prev, [editingId]: t})); setEditingId(null); }} />
            )}
        </div>
    );
}