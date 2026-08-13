"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  IconSearch,
  IconChevronDown,
  IconAdjustments,
  IconStar,
  IconStarFilled,
  IconX,
} from "@tabler/icons-react";
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
import { useFavoriteCategories } from "@/lib/useFavoriteCategories";

// 요리 종류(국가별)는 5개로 고정해둡니다. 하이디라오처럼 브랜드·상황 기준 태그는
// 여기 섞지 않고 ALL_THEMES에 별도로 둬서, 국가 분류가 계속 늘어나지 않게 합니다.
const ALL_COUNTRIES: CountryTag[] = ["한식", "중식", "양식", "일식", "멕시칸"];
const ALL_THEMES: ThemeTag[] = ["하이디라오"];
const FLAVORS: (FlavorTag | "전체")[] = ["전체", "매콤", "고소", "짭짤"];
const SORTS = ["최신순", "인기순", "저장됨"] as const;
type SortOption = (typeof SORTS)[number];

const PAGE_SIZE = 6;

export default function HomePage() {
  const { language, t } = useLanguage();
  const [recipes, setRecipes] = useState(mockRecipes);
  const [country, setCountry] = useState<CountryTag | "전체">("전체");
  const [theme, setTheme] = useState<ThemeTag | "전체">("전체");
  const [flavor, setFlavor] = useState<(typeof FLAVORS)[number]>("전체");
  const [sort, setSort] = useState<SortOption>("최신순");
  const [sortOpen, setSortOpen] = useState(false);
  const [savedDesc, setSavedDesc] = useState(true); // 저장됨 그룹 내 높은순/낮은순
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
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

  // 맨 위 "소스백과" 로고를 누르면 필터/정렬을 초기화하고 홈 첫 화면으로 되돌림
  const resetToHome = () => {
    setCountry("전체");
    setTheme("전체");
    setFlavor("전체");
    setSort("최신순");
    setPage(1);
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
        {/* 요리 종류 · 테마 분류. 다 펼쳐두면 브랜드 태그(하이디라오 등)가 늘어날 때마다
            계속 길어지니, 기본은 "전체" + 즐겨찾기한 것만 보여주고 나머지는 필터
            버튼을 눌러 바텀시트에서 고르는 방식으로 접어둡니다. */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setCountry("전체");
              setTheme("전체");
              setPage(1);
            }}
            className={`rounded-full px-3 py-1 text-sm ${
              country === "전체" && theme === "전체"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {t.all}
          </button>

          {ALL_COUNTRIES.filter((c) => isFavorite(`country:${c}`)).map((c) => (
            <button
              key={c}
              onClick={() => {
                setCountry(c);
                setTheme("전체");
                setPage(1);
              }}
              className={`rounded-full px-3 py-1 text-sm ${
                country === c
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {COUNTRY_LABELS[c][language]}
            </button>
          ))}

          {ALL_THEMES.filter((th) => isFavorite(`theme:${th}`)).map((th) => (
            <button
              key={th}
              onClick={() => {
                setTheme(th);
                setCountry("전체");
                setPage(1);
              }}
              className={`rounded-full px-3 py-1 text-sm ${
                theme === th
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {THEME_LABELS[th][language]}
            </button>
          ))}

          <button
            onClick={() => setFilterSheetOpen(true)}
            className="flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-600"
          >
            <IconAdjustments size={14} />
            {t.filterButton}
          </button>
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
                  ? "bg-brand-500 text-white"
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

      {/* 요리 종류 · 테마 전체 목록을 고르는 바텀시트. 로그인 여부와 상관없이
          별표(즐겨찾기)를 누르면 바로 위 기본 화면 칩에 추가됩니다. */}
      {filterSheetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setFilterSheetOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-s3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">{t.filterSheetTitle}</h2>
              <button onClick={() => setFilterSheetOpen(false)} aria-label={t.close}>
                <IconX size={18} className="text-gray-400" />
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-400">{t.filterFavoriteHint}</p>

            <h3 className="mt-4 text-xs font-semibold text-gray-500">
              {t.filterCountrySection}
            </h3>
            <div className="mt-1 divide-y divide-gray-100">
              {ALL_COUNTRIES.map((c) => (
                <div key={c} className="flex items-center justify-between py-2">
                  <button
                    onClick={() => {
                      setCountry(c);
                      setTheme("전체");
                      setPage(1);
                      setFilterSheetOpen(false);
                    }}
                    className="flex-1 text-left text-sm text-gray-700"
                  >
                    {COUNTRY_LABELS[c][language]}
                  </button>
                  <button
                    onClick={() => toggleFavorite(`country:${c}`)}
                    aria-label="favorite"
                  >
                    {isFavorite(`country:${c}`) ? (
                      <IconStarFilled size={18} className="text-brand-500" />
                    ) : (
                      <IconStar size={18} className="text-gray-300" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            <h3 className="mt-4 text-xs font-semibold text-gray-500">
              {t.filterThemeSection}
            </h3>
            <div className="mt-1 divide-y divide-gray-100">
              {ALL_THEMES.map((th) => (
                <div key={th} className="flex items-center justify-between py-2">
                  <button
                    onClick={() => {
                      setTheme(th);
                      setCountry("전체");
                      setPage(1);
                      setFilterSheetOpen(false);
                    }}
                    className="flex-1 text-left text-sm text-gray-700"
                  >
                    {THEME_LABELS[th][language]}
                  </button>
                  <button
                    onClick={() => toggleFavorite(`theme:${th}`)}
                    aria-label="favorite"
                  >
                    {isFavorite(`theme:${th}`) ? (
                      <IconStarFilled size={18} className="text-brand-500" />
                    ) : (
                      <IconStar size={18} className="text-gray-300" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
