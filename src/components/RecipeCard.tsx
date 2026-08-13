"use client";

import Link from "next/link";
import {
  IconBookmark,
  IconBookmarkFilled,
  IconHeart,
  IconHeartFilled,
  IconPhoto,
} from "@tabler/icons-react";
import type { MockRecipe } from "@/lib/mockRecipes";
import { subjectParticle } from "@/lib/korean";
import { useLanguage } from "@/lib/LanguageContext";
import { COUNTRY_LABELS, FLAVOR_LABELS } from "@/lib/i18n";

export default function RecipeCard({
  recipe,
  onToggleSave,
  onToggleLike,
}: {
  recipe: MockRecipe;
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
        <h3 className="font-semibold text-gray-900">
          {recipe.celebrityName && celebrityLabel ? (
            language === "en" ? (
              <>
                <span className="text-brand-600">{celebrityLabel}</span>
                <span className="text-gray-900">&rsquo;s </span>
                {recipe.nameEn}
              </>
            ) : (
              <>
                <span className="text-brand-600">{recipe.celebrityName}</span>
                <span className="text-gray-500">
                  {subjectParticle(recipe.celebrityName)} 소개한{" "}
                </span>
                {recipe.name}
              </>
            )
          ) : language === "en" ? (
            recipe.nameEn
          ) : (
            recipe.name
          )}
        </h3>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
            {COUNTRY_LABELS[recipe.country][language]}
          </span>
          <span className="text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
            #{FLAVOR_LABELS[recipe.flavor][language]}
          </span>
          {recipe.spiceLevel > 0 && (
            <span className="text-xs">{"🌶️".repeat(recipe.spiceLevel)}</span>
          )}
          {recipe.celebrityName && (
            <span className="text-xs rounded-full bg-brand-100 px-2 py-0.5 text-brand-700">
              #{celebrityLabel ?? recipe.celebrityName}
            </span>
          )}
        </div>
        </div>
      </Link>

      <div className="mt-auto px-4 pb-4">
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
      </div>
    </div>
  );
}
