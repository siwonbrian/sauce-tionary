"use client";

import Link from "next/link";
import {
  IconBookmark,
  IconBookmarkFilled,
  IconEye,
  IconHeart,
  IconHeartFilled,
  IconPhoto,
} from "@tabler/icons-react";
import type { MockRecipe } from "@/lib/mockRecipes";
import { useLanguage } from "@/lib/LanguageContext";
import { COUNTRY_LABELS, FLAVOR_LABELS, THEME_LABELS } from "@/lib/i18n";

export default function RecipeCard({
  recipe,
  viewCount,
  onToggleSave,
  onToggleLike,
}: {
  recipe: MockRecipe;
  // 목데이터 기준값 + 이 브라우저에서의 조회수를 합친 값. 부모(목록 페이지)에서
  // useViewCounts 훅으로 계산해서 내려줍니다.
  viewCount: number;
  onToggleSave: (id: string) => void;
  onToggleLike: (id: string) => void;
}) {
  const { language } = useLanguage();
  const celebrityLabel =
    language === "en" ? recipe.celebrityNameEn : recipe.celebrityName;

  return (
    // 카드 호버 살짝 뜨는 효과. SEED 디자인 시스템 Motion 토큰 중 마이크로 인터랙션용
    // duration($duration.d3, 150ms) + easing($timing-function.enter, cubic-bezier(0,0,0.15,1)) 적용.
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 transition-all duration-150 ease-[cubic-bezier(0,0,0.15,1)] hover:-translate-y-0.5 hover:shadow-s2">
      <button
        onClick={() => onToggleSave(recipe.id)}
        aria-label="저장"
        className="absolute top-3 right-3 z-10 rounded-full bg-white/90 p-1 text-gray-400 shadow-s1 hover:text-brand-500"
      >
        {recipe.saved ? (
          <IconBookmarkFilled size={20} className="text-brand-500" />
        ) : (
          <IconBookmark size={20} />
        )}
      </button>

      <Link href={`/recipes/${recipe.slug}`} className="block">
        {/* 완성 사진 자리. 사진이 없으면(대부분의 목데이터) 아이콘만 보여줌 */}
        <div className="flex aspect-[4/3] w-full items-center justify-center bg-gray-100">
          {recipe.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recipe.photoUrl}
              alt={language === "en" ? recipe.nameEn : recipe.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <IconPhoto size={28} className="text-gray-300" />
          )}
        </div>

        <div className="p-4 pr-8">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900">
            {language === "en" ? recipe.nameEn : recipe.name}
          </h3>
          {recipe.spiceLevel > 0 && (
            <span className="shrink-0 text-xs">
              {"🌶️".repeat(recipe.spiceLevel)}
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
            {COUNTRY_LABELS[recipe.country][language]}
          </span>
          <span className="text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
            #{FLAVOR_LABELS[recipe.flavor][language]}
          </span>
          {recipe.theme === "하이디라오" && (
            <span className="text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
              #{THEME_LABELS[recipe.theme][language]}
            </span>
          )}
          {recipe.celebrityName && (
            <span className="text-xs rounded-full bg-brand-100 px-2 py-0.5 text-brand-700">
              #{celebrityLabel ?? recipe.celebrityName}
            </span>
          )}
        </div>
        </div>
      </Link>

      <div className="mt-auto flex items-center gap-3 px-4 pb-4">
        <button
          onClick={() => onToggleLike(recipe.id)}
          aria-label="좋아요"
          className={`mt-3 flex items-center gap-1 text-sm ${
            recipe.liked ? "text-red-500" : "text-gray-500"
          }`}
        >
          {recipe.liked ? (
            <IconHeartFilled size={16} />
          ) : (
            <IconHeart size={16} />
          )}
          <span>{recipe.likeCount}</span>
        </button>
        <span className="mt-3 flex items-center gap-1 text-sm text-gray-400">
          <IconEye size={16} />
          <span>{viewCount}</span>
        </span>
      </div>
    </div>
  );
}
