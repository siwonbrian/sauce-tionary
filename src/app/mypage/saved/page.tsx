"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { IconArrowLeft, IconUserCircle } from "@tabler/icons-react";
import { mockRecipes } from "@/lib/mockRecipes";
import { useLanguage } from "@/lib/LanguageContext";
import { loggedIn } from "@/lib/auth";
import RecipeCard from "@/components/RecipeCard";
import Reveal from "@/components/Reveal";
import { useViewCounts } from "@/lib/useViewCounts";

export default function SavedPage() {
  const { t } = useLanguage();
  const [recipes, setRecipes] = useState(mockRecipes);
  const savedRecipes = useMemo(() => recipes.filter((r) => r.saved), [recipes]);
  const { getViewCount } = useViewCounts();

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

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-3">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-600">
          <IconArrowLeft size={16} />
          {t.backToHome}
        </Link>
      </header>

      <main className="mx-auto max-w-md px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900">{t.navSaved}</h1>

        {/* 저장 목록은 계정별 데이터라 로그인이 꼭 필요합니다.
            (설정 페이지와 달리 여기는 로그인 전엔 콘텐츠 자체가 없음) */}
        {!loggedIn ? (
          <div className="mt-10 flex flex-col items-center rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center">
            <IconUserCircle size={40} className="text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">{t.myPageLoginPrompt}</p>
            <Link
              href="/login"
              className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
            >
              {t.loginCta}
            </Link>
          </div>
        ) : savedRecipes.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">{t.noSaved}</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {savedRecipes.map((r, i) => (
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
        )}
      </main>
    </div>
  );
}
