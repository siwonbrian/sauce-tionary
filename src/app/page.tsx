"use client";

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
import { ALL_ICON, COUNTRY_ICONS, THEME_ICONS } from "@/lib/categoryIcons";

// 요리 종류(국가별)는 5개로 고정해둡니다. 하이디라오처럼 브랜드·상황 기준 태그는
// 여기 섞지 않고 ALL_THEMES에 별도로 둬서, 국가 분류가 계속 늘어나지 않게 합니다.
const ALL_COUNTRIES: CountryTag[] = ["한식", "중식", "양식", "일식", "멕시칸"];
const ALL_THEMES: ThemeTag[] = ["하이디라오"];
const FLAVORS: (FlavorTag | "전체")[] = ["전체", "매콤", "고소", "짭짤"];
const SORTS = ["최신순", "인기순", "저장됨"] as const;
type SortOption = (typeof SORTS)[number];

const PAGE_SIZE = 6;

// 레시피 이름에서 "OO 소스"/"OO 스타일 소스" 꼬리를 떼어내 짧은 태그 라벨로 씁니다.
// 예: "쌈장 스타일 소스" -> "쌈장", "마라 훠궈 소스" -> "마라 훠궈"
function shortRecipeLabel(name: string): string {
  return name.replace(/\s*(스타일\s*)?소스$/, "").trim();
}

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

  // 요리 종류 + 테마를 한 캐러셀에 같이 넣습니다 (국가/테마 구분 없이 "country:한식",
  // "theme:하이디라오" 처럼 접두어를 붙여 하나의 선택값으로 관리).
  const categoryActiveKey =
    country !== "전체"
      ? `country:${country}`
      : theme !== "전체"
        ? `theme:${theme}`
        : "전체";

  // 국가/테마를 선택하면 그 아래에 매콤·고소·짭짤 같은 고정 맛 태그 대신, 그
  // 카테고리에 실제로 속한 소스들의 이름(짧게 줄인 것)과 테마 태그를 보여줍니다.
  // "전체" 상태에서는 특정 카테고리 맥락이 없으니 아무것도 안 보여줍니다.
  const subTags = useMemo(() => {
    if (country === "전체" && theme === "전체") return [];
    const matches = recipes.filter((r) => {
      if (country !== "전체") return r.country === country;
      return r.theme === theme;
    });
    const labels = new Set<string>();
    matches.forEach((r) => {
      if (r.theme && !(theme !== "전체" && r.theme === theme)) {
        labels.add(THEME_LABELS[r.theme][language]);
      }
      labels.add(shortRecipeLabel(language === "en" ? r.nameEn : r.name));
    });
    return Array.from(labels);
  }, [recipes, country, theme, language]);

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
        {/* A안: 요리 종류 · 테마만 캐러셀로 (맛/정렬은 기존처럼 따로 유지) */}
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
          ]}
          activeKey={categoryActiveKey}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          onSelect={(key) => {
            if (key === "전체") {
              setCountry("전체");
              setTheme("전체");
            } else if (key.startsWith("country:")) {
              setCountry(key.slice("country:".length) as CountryTag);
              setTheme("전체");
            } else if (key.startsWith("theme:")) {
              setTheme(key.slice("theme:".length) as ThemeTag);
              setCountry("전체");
            }
            setPage(1);
          }}
          favoriteHint={t.filterFavoriteHint}
        />

        {/* 국가/테마를 고르면 그 카테고리에 속한 소스 이름·테마를 태그로 보여줌.
            누르면 검색어로 적용되어 목록이 그 소스로 좁혀짐. */}
        {subTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {subTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSearchTerm((prev) => (prev === tag ? "" : tag));
                  setPage(1);
                }}
                className={`rounded-full px-3 py-1 text-xs ${
                  searchTerm === tag
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* 맛 분류(독립 토글) + 정렬 드롭다운을 한 줄에 */}
        <div className="relative mt-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
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

          <div className="relative flex-shrink-0">
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
