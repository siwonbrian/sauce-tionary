"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { IconSearch, IconChevronDown } from "@tabler/icons-react";
import RecipeCard from "@/components/RecipeCard";
import Reveal from "@/components/Reveal";
import {
  mockRecipes,
  type CountryTag,
  type FlavorTag,
} from "@/lib/mockRecipes";
import { useLanguage } from "@/lib/LanguageContext";
import { COUNTRY_LABELS, FLAVOR_LABELS } from "@/lib/i18n";

const COUNTRIES: (CountryTag | "전체")[] = [
  "전체",
  "한식",
  "중식",
  "양식",
  "일식",
  "멕시칸",
];
const FLAVORS: (FlavorTag | "전체")[] = ["전체", "매콤", "고소", "짭짤"];
const SORTS = ["최신순", "인기순", "저장됨"] as const;
type SortOption = (typeof SORTS)[number];

const PAGE_SIZE = 6;

export default function HomePage() {
  const { language, t } = useLanguage();
  const [recipes, setRecipes] = useState(mockRecipes);
  const [country, setCountry] = useState<(typeof COUNTRIES)[number]>("전체");
  const [flavor, setFlavor] = useState<(typeof FLAVORS)[number]>("전체");
  const [sort, setSort] = useState<SortOption>("최신순");
  const [sortOpen, setSortOpen] = useState(false);
  const [savedDesc, setSavedDesc] = useState(true); // 저장됨 그룹 내 높은순/낮은순
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleSave = (id: string) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, saved: !r.saved } : r))
    );
  };

  const toggleLike = (id: string) => {
    setRecipes((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              liked: !r.liked,
              likeCount: r.liked ? r.likeCount - 1 : r.likeCount + 1,
            }
          : r
      )
    );
  };

  // 맨 위 "소스백과" 로고를 누르면 필터/정렬을 초기화하고 홈 첫 화면으로 되돌림
  const resetToHome = () => {
    setCountry("전체");
    setFlavor("전체");
    setSort("최신순");
    setPage(1);
  };

  // 국가 · 맛 · 검색어 필터를 실제로 적용
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return recipes.filter((r) => {
      const countryOk = country === "전체" || r.country === country;
      const flavorOk = flavor === "전체" || r.flavor === flavor;
      const searchOk =
        term === "" ||
        r.name.toLowerCase().includes(term) ||
        r.nameEn.toLowerCase().includes(term) ||
        (r.celebrityName?.toLowerCase().includes(term) ?? false) ||
        (r.celebrityNameEn?.toLowerCase().includes(term) ?? false);
      return countryOk && flavorOk && searchOk;
    });
  }, [recipes, country, flavor, searchTerm]);

  const savedGrouped = useMemo(() => {
    if (sort !== "저장됨") return null;
    const saved = filtered.filter((r) => r.saved);
    const groups: Record<string, typeof saved> = {};
    for (const r of saved) {
      groups[r.flavor] = groups[r.flavor] ? [...groups[r.flavor], r] : [r];
    }
    // 그룹 내부에서 좋아요 수 기준 높은순/낮은순 정렬
    for (const key of Object.keys(groups)) {
      groups[key] = [...groups[key]].sort((a, b) =>
        savedDesc ? b.likeCount - a.likeCount : a.likeCount - b.likeCount
      );
    }
    return groups;
  }, [filtered, sort, savedDesc]);

  const sortedList = useMemo(() => {
    if (sort === "저장됨") return [];
    const list = [...filtered];
    if (sort === "인기순") {
      list.sort((a, b) => b.likeCount - a.likeCount);
    } else {
      list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return list;
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedList.length / PAGE_SIZE));
  const pagedList = sortedList.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-md items-center gap-2">
          <button
            onClick={resetToHome}
            className="text-lg font-bold text-gray-900"
          >
            {t.siteName}
          </button>
          <div className="ml-auto flex flex-1 items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5">
            <IconSearch size={16} className="text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder={t.searchPlaceholder}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-4">
        {/* 국가별 분류 */}
        <div className="flex flex-wrap gap-2">
          {COUNTRIES.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCountry(c);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1 text-sm ${
                country === c
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {c === "전체" ? t.all : COUNTRY_LABELS[c][language]}
            </button>
          ))}
        </div>

        {/* 맛 분류 (국가 버튼 아래에 표시) */}
        <div className="mt-2 flex flex-wrap gap-2">
          {FLAVORS.map((f) => (
            <button
              key={f}
              onClick={() => {
                setFlavor(f);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1 text-sm ${
                flavor === f
                  ? "bg-amber-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {f === "전체" ? t.all : FLAVOR_LABELS[f][language]}
            </button>
          ))}
        </div>

        {/* 정렬 드롭다운 */}
        <div className="relative mt-3 flex justify-end">
          <button
            onClick={() => setSortOpen((v) => !v)}
            className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600"
          >
            {sort === "최신순" ? t.sortNewest : sort === "인기순" ? t.sortPopular : t.sortSaved}
            <IconChevronDown size={14} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-9 z-10 w-28 rounded-lg border border-gray-200 bg-white py-1 shadow-sm">
              {SORTS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSort(s);
                    setSortOpen(false);
                    setPage(1);
                  }}
                  className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 ${
                    sort === s ? "font-semibold text-amber-600" : "text-gray-600"
                  }`}
                >
                  {s === "최신순" ? t.sortNewest : s === "인기순" ? t.sortPopular : t.sortSaved}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 저장됨: 맛 분류별로 그룹핑 + 그룹 내 높은순/낮은순 */}
        {sort === "저장됨" && savedGrouped && (
          <div className="mt-4 space-y-6">
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSavedDesc(true)}
                className={`rounded-full px-2.5 py-1 text-xs ${
                  savedDesc ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {t.savedDesc}
              </button>
              <button
                onClick={() => setSavedDesc(false)}
                className={`rounded-full px-2.5 py-1 text-xs ${
                  !savedDesc ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {t.savedAsc}
              </button>
            </div>

            {Object.keys(savedGrouped).length === 0 && (
              <p className="py-8 text-center text-sm text-gray-400">
                {t.noSaved}
              </p>
            )}

            {Object.entries(savedGrouped).map(([flavorGroup, items]) => (
              <div key={flavorGroup}>
                <h2 className="mb-2 text-sm font-semibold text-gray-500">
                  #{FLAVOR_LABELS[flavorGroup as FlavorTag][language]}
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {items.map((r, i) => (
                    <Reveal key={r.id} delay={i * 40}>
                      <RecipeCard
                        recipe={r}
                        onToggleSave={toggleSave}
                        onToggleLike={toggleLike}
                      />
                    </Reveal>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 최신순 / 인기순: 일반 그리드 + 페이지네이션 */}
        {sort !== "저장됨" && (
          <>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {pagedList.map((r, i) => (
                <Reveal key={r.id} delay={i * 40}>
                  <RecipeCard
                    recipe={r}
                    onToggleSave={toggleSave}
                    onToggleLike={toggleLike}
                  />
                </Reveal>
              ))}
            </div>

            {pagedList.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-400">
                {t.noResults}
              </p>
            )}

            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-8 w-8 rounded-full text-sm ${
                        page === p
                          ? "bg-gray-900 text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>
            )}
          </>
        )}

        <Link
          href="/recipes/new"
          className="mt-8 flex items-center justify-center rounded-xl border border-dashed border-gray-300 py-3 text-sm text-gray-500"
        >
          {t.reportCta}
        </Link>
      </main>
    </div>
  );
}
