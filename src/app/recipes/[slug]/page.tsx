"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconBookmark,
  IconBookmarkFilled,
  IconHeart,
  IconHeartFilled,
  IconShare,
  IconExternalLink,
  IconPhoto,
} from "@tabler/icons-react";
import { mockRecipes } from "@/lib/mockRecipes";
import { subjectParticle } from "@/lib/korean";
import { formatIngredientAmount, type UnitSystem } from "@/lib/units";
import { useLanguage } from "@/lib/LanguageContext";
import { COUNTRY_LABELS, FLAVOR_LABELS } from "@/lib/i18n";
import { loggedIn } from "@/lib/auth";

export default function RecipeDetailPage() {
  const params = useParams<{ slug: string }>();
  const recipe = mockRecipes.find((r) => r.slug === params.slug);
  const { language, t } = useLanguage();

  // 아직 로그인·Supabase 연동 전이라 이 페이지 안에서만 쓰는 임시 상태입니다.
  // 실제 연동 시 이 부분을 Supabase 쿼리/뮤테이션으로 교체하면 됩니다.
  const [saved, setSaved] = useState(recipe?.saved ?? false);
  const [liked, setLiked] = useState(recipe?.liked ?? false);
  const [likeCount, setLikeCount] = useState(recipe?.likeCount ?? 0);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("kr");
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  if (!recipe) {
    return (
      <main className="p-6">
        <h1 className="text-lg font-bold">{t.recipeNotFound}</h1>
        <Link href="/" className="mt-2 inline-block text-sm text-amber-600">
          {t.backToHome}
        </Link>
      </main>
    );
  }

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      await navigator.clipboard.writeText(url);
      setShareMessage(t.shareCopied);
    } catch {
      setShareMessage(url); // 클립보드 접근이 막힌 환경이면 링크를 화면에 그대로 보여줌
    }
    setTimeout(() => setShareMessage(""), 3000);
  };

  const celebrityLabel =
    language === "en" ? recipe.celebrityNameEn : recipe.celebrityName;

  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-3">
        <Link href="/" className="flex items-center gap-1 text-sm text-gray-600">
          <IconArrowLeft size={16} />
          {t.backToList}
        </Link>
      </header>

      <main className="mx-auto max-w-md px-4 py-4">
        {/* 완성 사진 자리. 사진이 없으면(대부분의 목데이터) 아이콘만 보여줌 */}
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-gray-100">
          {recipe.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recipe.photoUrl}
              alt={language === "en" ? recipe.nameEn : recipe.name}
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            <IconPhoto size={40} className="text-gray-300" />
          )}
        </div>

        <div className="mt-4 flex items-start justify-between gap-2">
          <h1 className="text-xl font-bold text-gray-900">
            {recipe.celebrityName && celebrityLabel ? (
              language === "en" ? (
                <>
                  <span className="text-amber-600">{celebrityLabel}</span>
                  <span className="text-gray-900">&rsquo;s </span>
                  {recipe.nameEn}
                </>
              ) : (
                <>
                  <span className="text-amber-600">{recipe.celebrityName}</span>
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
          </h1>
          <button
            onClick={() => setSaved((v) => !v)}
            aria-label="저장"
            className={saved ? "text-amber-500" : "text-gray-400"}
          >
            {saved ? <IconBookmarkFilled size={22} /> : <IconBookmark size={22} />}
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
            {COUNTRY_LABELS[recipe.country][language]}
          </span>
          <span className="text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
            #{FLAVOR_LABELS[recipe.flavor][language]}
          </span>
          {recipe.spiceLevel > 0 && (
            <span className="text-xs">{"🌶️".repeat(recipe.spiceLevel)}</span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={() => {
              setLiked((v) => !v);
              setLikeCount((c) => (liked ? c - 1 : c + 1));
            }}
            className={`flex items-center gap-1 text-sm ${liked ? "text-red-500" : "text-gray-500"}`}
          >
            {liked ? <IconHeartFilled size={18} /> : <IconHeart size={18} />}
            {likeCount}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-sm text-gray-500"
          >
            <IconShare size={18} />
            {t.share}
          </button>
        </div>
        {shareMessage && (
          <p className="mt-1 break-all text-xs text-amber-600">{shareMessage}</p>
        )}

        {/* 계량 단위 변환. 기본값(그램)에서 체크하면 컵·스푼 근사치로 바뀌는 단일 체크박스 방식
            (Plan to Eat 등에서 흔히 쓰는 패턴 - 페어 버튼 대신 체크박스 하나로 단순화) */}
        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">{t.ingredients}</h2>
          <label className="flex items-center gap-1.5 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={unitSystem === "us"}
              onChange={(e) => setUnitSystem(e.target.checked ? "us" : "kr")}
              className="h-3.5 w-3.5 rounded border-gray-300 accent-amber-500"
            />
            {t.unitToggleLabel}
          </label>
        </div>

        <ul className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-100">
          {recipe.ingredients.map((ing) => (
            <li key={ing.name} className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="text-gray-700">
                {language === "en" ? ing.nameEn : ing.name}
              </span>
              <span className="font-medium text-gray-900">
                {formatIngredientAmount(ing, unitSystem)}
              </span>
            </li>
          ))}
        </ul>
        {unitSystem === "us" && recipe.ingredients.some((i) => i.unit === "g") && (
          <p className="mt-1.5 text-xs text-gray-400">{t.unitApproxNote}</p>
        )}

        <h2 className="mt-6 text-sm font-semibold text-gray-700">{t.instructions}</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          {language === "en" ? recipe.instructionsEn : recipe.instructions}
        </p>

        <a
          href={recipe.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
        >
          <IconExternalLink size={14} />
          {t.source}: {language === "en" ? recipe.sourceNameEn : recipe.sourceName}
        </a>

        {/* 개인 레시피 노트 (비공개, 본인만 확인). 로그인 전에는 입력을 막고
            로그인 유도 문구 + 버튼만 보여줌 */}
        <div className="mt-8 border-t border-gray-100 pt-4">
          <h2 className="text-sm font-semibold text-gray-700">{t.myNote}</h2>
          <p className="mt-0.5 text-xs text-gray-400">
            {loggedIn ? t.myNoteHint : t.myNoteLoginPrompt}
          </p>
          <textarea
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setNoteSaved(false);
            }}
            placeholder={t.myNotePlaceholder}
            rows={3}
            disabled={!loggedIn}
            className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-sm outline-none focus:border-amber-400 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
          />
          {loggedIn ? (
            <>
              <button
                onClick={() => setNoteSaved(true)}
                className="mt-2 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white"
              >
                {t.saveNote}
              </button>
              {noteSaved && <span className="ml-2 text-xs text-amber-600">{t.saved}</span>}
            </>
          ) : (
            <Link
              href="/login"
              className="mt-2 inline-block rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white"
            >
              {t.loginCta}
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
