"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  IconSearch,
  IconChevronDown,
  IconStar,
  IconStarFilled,
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

// "전체" 칩을 누르면 국가·테마 칩들이 그 자리에서 튀어나오듯 펼쳐지는 애니메이션.
// visible이 false→true로 바뀔 때 scale/opacity가 전환되고, delay를 칩마다 다르게 줘서
// 하나씩 순서대로 튀어나오는 것처럼 보이게 합니다(SEED 마이크로 모션: duration 200ms,
// $timing-function.enter-expressive 커브).
function PopChip({
  label,
  selected,
  favorite,
  visible,
  delay,
  onSelect,
  onToggleFavorite,
}: {
  label: string;
  selected: boolean;
  favorite: boolean;
  visible: boolean;
  delay: number;
  onSelect: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <span
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      className={`relative inline-flex origin-left transition-all duration-200 ease-[cubic-bezier(0.03,0.4,0.1,1)] ${
        visible ? "scale-100 opacity-100" : "scale-50 opacity-0"
      }`}
    >
      <button
        onClick={onSelect}
        className={`rounded-full px-3 py-1 text-sm ${
          selected ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
        }`}
      >
        {label}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        aria-label="favorite"
        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-s1"
      >
        {favorite ? (
          <IconStarFilled size={10} className="text-brand-500" />
        ) : (
          <IconStar size={10} className="text-gray-300" />
        )}
      </button>
    </span>
  );
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
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  // "전체" 칩을 눌러 펼쳐지자마자 바로 보이는 상태로 두면 트랜지션 없이 뿅 나타나므로,
  // 펼쳐진 다음 프레임에 true로 바꿔서 튀어나오는 애니메이션이 실제로 재생되게 합니다.
  const [chipsVisible, setChipsVisible] = useState(false);
  const { isFavorite, toggleFavorite } = useFavoriteCategories();

  useEffect(() => {
    if (!categoriesExpanded) {
      setChipsVisible(false);
      return;
    }
    const raf = requestAnimationFrame(() => setChipsVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [categoriesExpanded]);

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
    setCategoriesExpanded(false);
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
        {/* 요리 종류 · 테마 분류. "전체"를 누르면 안에서 밖으로 튀어나오듯 전체 목록이
            펼쳐지고, 별표를 누르면 즐겨찾기로 고정돼서 접었을 때도 바로 보입니다. */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              if (categoriesExpanded) {
                setCountry("전체");
                setTheme("전체");
                setPage(1);
                setCategoriesExpanded(false);
              } else {
                setCategoriesExpanded(true);
              }
            }}
            className={`rounded-full px-3 py-1 text-sm ${
              country === "전체" && theme === "전체"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {t.all}
          </button>

          {!categoriesExpanded &&
            ALL_COUNTRIES.filter((c) => isFavorite(`country:${c}`)).map((c) => (
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

          {!categoriesExpanded &&
            ALL_THEMES.filter((th) => isFavorite(`theme:${th}`)).map((th) => (
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

          {categoriesExpanded &&
            ALL_COUNTRIES.map((c, i) => (
              <PopChip
                key={c}
                label={COUNTRY_LABELS[c][language]}
                selected={country === c}
                favorite={isFavorite(`country:${c}`)}
                visible={chipsVisible}
                delay={i * 30}
                onSelect={() => {
                  setCountry(c);
                  setTheme("전체");
                  setPage(1);
                  setCategoriesExpanded(false);
                }}
                onToggleFavorite={() => toggleFavorite(`country:${c}`)}
              />
            ))}

          {categoriesExpanded &&
            ALL_THEMES.map((th, i) => (
              <PopChip
                key={th}
                label={THEME_LABELS[th][language]}
                selected={theme === th}
                favorite={isFavorite(`theme:${th}`)}
                visible={chipsVisible}
                delay={(ALL_COUNTRIES.length + i) * 30}
                onSelect={() => {
                  setTheme(th);
                  setCountry("전체");
                  setPage(1);
                  setCategoriesExpanded(false);
                }}
                onToggleFavorite={() => toggleFavorite(`theme:${th}`)}
              />
            ))}
        </div>
        {categoriesExpanded && (
          <p className="mt-1 text-xs text-gray-400">{t.filterFavoriteHint}</p>
        )}

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
    </div>
  );
}
