"use client";

// B안: 국가·테마·맛·정렬까지 모든 필터를 캐러셀 한 줄(같은 필터 영역) 안에 모아본
// 버전입니다. A안(/  , 국가+테마만 캐러셀)과 비교해보고 더 나은 쪽으로 결정하면
// 되고, 결정 후에는 선택 안 된 쪽 파일(이 폴더 또는 src/app/page.tsx)을 지우면
// 됩니다.
//
// A안과 다른 점: 국가/테마/맛이 하나의 선택지 묶음이라 배민 탭처럼 한 번에 하나만
// 고를 수 있고(예: "매콤"을 고르면 국가 선택은 풀림), 정렬 버튼도 같은 줄 끝에
// 붙어 있습니다.

import { useMemo, useState } from "react";
import Link from "next/link";
import { IconSearch, IconChevronDown } from "@tabler/icons-react";
import RecipeCard from "@/components/RecipeCard";
import Reveal from "@/components/Reveal";
import CategoryCarousel from "@/components/CategoryCarousel";
import {
  mockRecipes,
  type CountryTag,
  type FlavorTag,
  type ThemeTag,
} from "@/lib/mockRecipes";
import { useLanguage } from "@/lib/LanguageContext";
import { COUNTRY_LABELS, FLAVOR_LABELS, THEME_LABELS } from "@/lib/i18n";
import { useFavoriteCategories } from "@/lib/useFavoriteCategories";
import { ALL_ICON, COUNTRY_ICONS, THEME_ICONS, FLAVOR_ICONS } from "@/lib/categoryIcons";

const ALL_COUNTRIES: CountryTag[] = ["한식", "중식", "양식", "일식", "멕시칸"];
const ALL_THEMES: ThemeTag[] = ["하이디라오"];
const ALL_FLAVORS: FlavorTag[] = ["매콤", "고소", "짭짤"];
const SORTS = ["최신순", "인기순", "저장됨"] as const;
type SortOption = (typeof SORTS)[number];

const PAGE_SIZE = 6;

export default function HomePageVariantB() {
  const { language, t } = useLanguage();
  const [recipes, setRecipes] = useState(mockRecipes);
  // "전체" | "country:한식" | "theme:하이디라오" | "flavor:매콤" 형태의 단일 선택값.
  // 배민 탭처럼 한 번에 하나만 고를 수 있게 국가·테마·맛을 한 축으로 합쳤습니다.
  const [selected, setSelected] = useState("전체");
  const [sort, setSort] = useState<SortOption>("최신순");
  const [sortOpen, setSortOpen] = useState(false);
  const [savedDesc, setSavedDesc] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const { isFavorite, toggleFavorite } = useFavoriteCategories();

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

  const resetToHome = () => {
    setSelected("전체");
    setSort("최신순");
    setPage(1);
  };

  const [selectedKind, selectedValue] =
    selected === "전체" ? [null, null] : selected.split(":");

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return recipes.filter((r) => {
      const matchOk =
        selectedKind === null ||
        (selectedKind === "country" && r.country === selectedValue) ||
        (selectedKind === "theme" && r.theme === selectedValue) ||
        (selectedKind === "flavor" && r.flavor === selectedValue);
      const searchOk =
        term === "" ||
        r.name.toLowerCase().includes(term) ||
        r.nameEn.toLowerCase().includes(term) ||
        (r.celebrityName?.toLowerCase().includes(term) ?? false) ||
        (r.celebrityNameEn?.toLowerCase().includes(term) ?? false);
      return matchOk && searchOk;
    });
  }, [recipes, selectedKind, selectedValue, searchTerm]);

  const savedGrouped = useMemo(() => {
    if (sort !== "저장됨") return null;
    const saved = filtered.filter((r) => r.saved);
    const groups: Record<string, typeof saved> = {};
    for (const r of saved) {
      groups[r.flavor] = groups[r.flavor] ? [...groups[r.flavor], r] : [r];
    }
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
  const pagedList = sortedList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-md items-center gap-2">
          <button onClick={resetToHome} className="text-lg font-bold text-gray-900">
            {t.siteName}
            <span className="ml-1 text-xs font-normal text-gray-400">(B안)</span>
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
        {/* B안: 요리 종류 + 테마 + 맛 + 정렬을 전부 이 한 줄(캐러셀) 안에 모음 */}
        <CategoryCarousel
          allItem={{ key: "전체", emoji: ALL_ICON, label: t.all }}
          items={[
            ...ALL_COUNTRIES.map((c) => ({
              key: `country:${c}`,
              emoji: COUNTRY_ICONS[c],
              label: COUNTRY_LABELS[c][language],
            })),
            ...ALL_THEMES.map((th) => ({
              key: `theme:${th}`,
              emoji: THEME_ICONS[th],
              label: THEME_LABELS[th][language],
            })),
            ...ALL_FLAVORS.map((f) => ({
              key: `flavor:${f}`,
              emoji: FLAVOR_ICONS[f],
              label: FLAVOR_LABELS[f][language],
            })),
          ]}
          activeKey={selected}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          onSelect={(key) => {
            setSelected(key);
            setPage(1);
          }}
          favoriteHint={t.filterFavoriteHint}
          trailing={
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setSortOpen((v) => !v)}
                className="flex h-8 items-center gap-1 rounded-full border border-gray-200 px-2.5 text-xs text-gray-600"
              >
                {sort === "최신순" ? t.sortNewest : sort === "인기순" ? t.sortPopular : t.sortSaved}
                <IconChevronDown size={12} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-9 z-10 w-28 rounded-lg border border-gray-200 bg-white py-1 shadow-s2">
                  {SORTS.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSort(s);
                        setSortOpen(false);
                        setPage(1);
                      }}
                      className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 ${
                        sort === s ? "font-semibold text-brand-600" : "text-gray-600"
                      }`}
                    >
                      {s === "최신순" ? t.sortNewest : s === "인기순" ? t.sortPopular : t.sortSaved}
                    </button>
                  ))}
                </div>
              )}
            </div>
          }
        />

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
              <p className="py-8 text-center text-sm text-gray-400">{t.noSaved}</p>
            )}

            {Object.entries(savedGrouped).map(([flavorGroup, items]) => (
              <div key={flavorGroup}>
                <h2 className="mb-2 text-sm font-semibold text-gray-500">
                  #{FLAVOR_LABELS[flavorGroup as FlavorTag][language]}
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {items.map((r, i) => (
                    <Reveal key={r.id} delay={i * 40}>
                      <RecipeCard recipe={r} onToggleSave={toggleSave} onToggleLike={toggleLike} />
                    </Reveal>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {sort !== "저장됨" && (
          <>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {pagedList.map((r, i) => (
                <Reveal key={r.id} delay={i * 40}>
                  <RecipeCard recipe={r} onToggleSave={toggleSave} onToggleLike={toggleLike} />
                </Reveal>
              ))}
            </div>

            {pagedList.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-400">{t.noResults}</p>
            )}

            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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
                ))}
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
