"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { IconSearch, IconChevronDown, IconFilter } from "@tabler/icons-react";
import RecipeCard from "@/components/RecipeCard";
import Reveal from "@/components/Reveal";
import {
  mockRecipes,
  type CountryTag,
  type FlavorTag,
  type ThemeTag,
} from "@/lib/mockRecipes";
import { useLanguage } from "@/lib/LanguageContext";
import { COUNTRY_LABELS, FLAVOR_LABELS, THEME_LABELS } from "@/lib/i18n";
import { useViewCounts } from "@/lib/useViewCounts";

// 요리 종류(국가별)는 5개로 고정해둡니다. 하이디라오처럼 브랜드·상황 기준 태그는
// 여기 섞지 않고 필터 버튼 안에 별도로 둬서, 상단 탭이 계속 늘어나지 않게 합니다.
const ALL_COUNTRIES: CountryTag[] = ["한식", "중식", "양식", "일식", "멕시칸"];
const ALL_THEMES: ThemeTag[] = ["하이디라오"];
const FLAVORS: (FlavorTag | "전체")[] = ["전체", "매콤", "고소", "짭짤"];
const SORTS = ["최신순", "인기순", "많이 본", "저장됨"] as const;
type SortOption = (typeof SORTS)[number];

// 필터 버튼 옆 요약에 "어떤 순서로 골랐는지"를 보여주기 위한 두 축
type FilterKind = "theme" | "flavor";

const PAGE_SIZE = 6;

export default function HomePage() {
  const { language, t } = useLanguage();
  const [recipes, setRecipes] = useState(mockRecipes);
  const [country, setCountry] = useState<CountryTag | "전체">("전체");
  const [theme, setTheme] = useState<ThemeTag | "전체">("전체");
  const [flavor, setFlavor] = useState<(typeof FLAVORS)[number]>("전체");
  // 테마·맛을 고른 순서를 따로 기록해서, 필터 버튼 옆에 고른 순서 그대로 보여줍니다.
  const [filterOrder, setFilterOrder] = useState<FilterKind[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState<SortOption>("최신순");
  const [sortOpen, setSortOpen] = useState(false);
  const [savedDesc, setSavedDesc] = useState(true); // 저장됨 그룹 내 높은순/낮은순
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const { getViewCount } = useViewCounts();

  // 정렬 버튼/드롭다운에 보여줄 라벨 (최신순/인기순/많이 본/저장됨)
  const sortLabel = (s: SortOption) =>
    s === "최신순"
      ? t.sortNewest
      : s === "인기순"
        ? t.sortPopular
        : s === "많이 본"
          ? t.sortMostViewed
          : t.sortSaved;

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
    setTheme("전체");
    setFlavor("전체");
    setFilterOrder([]);
    setSort("최신순");
    setPage(1);
  };

  // 테마를 고르면 filterOrder 맨 뒤로 보내고(순서 기록), "전체"로 되돌리면 빼줍니다.
  const selectTheme = (value: ThemeTag | "전체") => {
    setTheme(value);
    setPage(1);
    setFilterOrder((prev) => {
      const rest = prev.filter((k) => k !== "theme");
      return value === "전체" ? rest : [...rest, "theme"];
    });
  };

  const selectFlavor = (value: (typeof FLAVORS)[number]) => {
    setFlavor(value);
    setPage(1);
    setFilterOrder((prev) => {
      const rest = prev.filter((k) => k !== "flavor");
      return value === "전체" ? rest : [...rest, "flavor"];
    });
  };

  // 요리 종류 · 테마 · 맛 · 검색어 필터를 실제로 적용
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return recipes.filter((r) => {
      const countryOk = country === "전체" || r.country === country;
      const themeOk = theme === "전체" || r.theme === theme;
      const flavorOk = flavor === "전체" || r.flavor === flavor;
      const searchOk =
        term === "" ||
        r.name.toLowerCase().includes(term) ||
        r.nameEn.toLowerCase().includes(term) ||
        (r.celebrityName?.toLowerCase().includes(term) ?? false) ||
        (r.celebrityNameEn?.toLowerCase().includes(term) ?? false);
      return countryOk && themeOk && flavorOk && searchOk;
    });
  }, [recipes, country, theme, flavor, searchTerm]);

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
    } else if (sort === "많이 본") {
      list.sort(
        (a, b) => getViewCount(b.id, b.viewCount) - getViewCount(a.id, a.viewCount)
      );
    } else {
      list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return list;
  }, [filtered, sort, getViewCount]);

  const totalPages = Math.max(1, Math.ceil(sortedList.length / PAGE_SIZE));
  const pagedList = sortedList.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // 필터 버튼 옆에 보여줄 텍스트: 고른 게 있으면 고른 순서대로, 없으면 예시를 보여줌
  const activeFilterLabels = filterOrder.map((kind) =>
    kind === "theme"
      ? THEME_LABELS[theme as ThemeTag][language]
      : FLAVOR_LABELS[flavor as FlavorTag][language]
  );

  const filterExampleHint = useMemo(() => {
    const themeLabels = ALL_THEMES.map((th) => THEME_LABELS[th][language]);
    const flavorLabels = FLAVORS.filter((f) => f !== "전체").map(
      (f) => FLAVOR_LABELS[f as FlavorTag][language]
    );
    return [...themeLabels, ...flavorLabels].join(" · ");
  }, [language]);

  const countryTabs: { key: string; label: string; value: CountryTag | "전체" }[] = [
    { key: "전체", label: t.all, value: "전체" },
    ...ALL_COUNTRIES.map((c) => ({
      key: c,
      label: COUNTRY_LABELS[c][language],
      value: c as CountryTag | "전체",
    })),
  ];

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
        {/* 요리 종류 탭: 검색창 바로 밑, 텍스트 + 밑줄 방식 (아이콘/테마 없이 나라만) */}
        <div className="flex gap-5 overflow-x-auto border-b border-gray-100 no-scrollbar">
          {countryTabs.map((tab) => {
            const active = country === tab.value;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setCountry(tab.value);
                  setPage(1);
                }}
                className={`relative flex-shrink-0 pb-2 text-sm transition-colors ${
                  active ? "font-semibold text-gray-900" : "text-gray-400"
                }`}
              >
                {tab.label}
                {active && (
                  <span className="absolute -bottom-px left-0 h-0.5 w-full rounded-full bg-brand-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* 필터 버튼: 탭 밑에 배치, 눌러서 테마·맛 선택. 옆에는 고른 순서대로 요약 표시,
            아무것도 안 골랐으면 예시를 회색으로 보여줌. */}
        <div className="relative mt-3 flex items-center gap-2">
          <button
            onClick={() => setFilterOpen((v) => !v)}
            className="flex flex-shrink-0 items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600"
          >
            <IconFilter size={14} />
            {t.filterButton}
          </button>
          <div className="flex-1 truncate text-xs">
            {activeFilterLabels.length > 0 ? (
              <span className="text-gray-700">{activeFilterLabels.join(", ")}</span>
            ) : (
              <span className="text-gray-300">
                {t.filterExamplePrefix} {filterExampleHint}
              </span>
            )}
          </div>

          {filterOpen && (
            <div className="absolute left-0 top-10 z-10 w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-s2">
              <p className="mb-1.5 text-xs font-semibold text-gray-400">
                {t.filterThemeSection}
              </p>
              <div className="mb-3 flex flex-wrap gap-2">
                <button
                  onClick={() => selectTheme("전체")}
                  className={`rounded-full px-3 py-1 text-sm ${
                    theme === "전체"
                      ? "bg-brand-500 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {t.all}
                </button>
                {ALL_THEMES.map((th) => (
                  <button
                    key={th}
                    onClick={() => selectTheme(theme === th ? "전체" : th)}
                    className={`rounded-full px-3 py-1 text-sm ${
                      theme === th
                        ? "bg-brand-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {THEME_LABELS[th][language]}
                  </button>
                ))}
              </div>

              <p className="mb-1.5 text-xs font-semibold text-gray-400">
                {t.filterFlavorSection}
              </p>
              <div className="flex flex-wrap gap-2">
                {FLAVORS.map((f) => (
                  <button
                    key={f}
                    onClick={() => selectFlavor(f === "전체" ? "전체" : flavor === f ? "전체" : f)}
                    className={`rounded-full px-3 py-1 text-sm ${
                      flavor === f
                        ? "bg-brand-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {f === "전체" ? t.all : FLAVOR_LABELS[f][language]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 정렬: 필터와 별개로, 항상 레시피 목록 바로 위 오른쪽에 고정 */}
        <div className="relative mt-4 flex items-center justify-end">
          <button
            onClick={() => setSortOpen((v) => !v)}
            className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600"
          >
            {sortLabel(sort)}
            <IconChevronDown size={14} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-9 z-10 w-32 rounded-lg border border-gray-200 bg-white py-1 shadow-s2">
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
                  {sortLabel(s)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 저장됨: 맛 분류별로 그룹핑 + 그룹 내 높은순/낮은순 */}
        {sort === "저장됨" && savedGrouped && (
          <div className="mt-3 space-y-6">
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
                        viewCount={getViewCount(r.id, r.viewCount)}
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
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {pagedList.map((r, i) => (
                <Reveal key={r.id} delay={i * 40}>
                  <RecipeCard
                    recipe={r}
                    viewCount={getViewCount(r.id, r.viewCount)}
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
