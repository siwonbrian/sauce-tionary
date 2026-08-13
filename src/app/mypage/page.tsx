"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  IconArrowLeft,
  IconChevronRight,
  IconLanguage,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react";
import { mockRecipes } from "@/lib/mockRecipes";
import { useLanguage } from "@/lib/LanguageContext";
import { loggedIn } from "@/lib/auth";
import RecipeCard from "@/components/RecipeCard";
import Reveal from "@/components/Reveal";

function MyPageContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "settings" ? "settings" : "saved";
  const [tab, setTab] = useState<"saved" | "settings">(initialTab);
  const { t, language, toggleLanguage } = useLanguage();
  const [recipes, setRecipes] = useState(mockRecipes);

  const savedRecipes = useMemo(() => recipes.filter((r) => r.saved), [recipes]);

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
        <Link href="/" className="flex items-center gap-1 text-sm text-gray-600">
          <IconArrowLeft size={16} />
          {t.backToHome}
        </Link>
      </header>

      <main className="mx-auto max-w-md px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900">{t.myPageTitle}</h1>

        {/* 저장됨/설정 탭 전환 */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setTab("saved")}
            className={`rounded-full px-3 py-1.5 text-sm ${
              tab === "saved" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {t.navSaved}
          </button>
          <button
            onClick={() => setTab("settings")}
            className={`rounded-full px-3 py-1.5 text-sm ${
              tab === "settings" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {t.navSettings}
          </button>
        </div>

        {/* 로그인 전에는 탭과 무관하게 로그인 유도 카드만 보여줌.
            Supabase 연동 후 loggedIn이 실제 세션 값으로 바뀌면 아래 탭별 콘텐츠가 그대로 노출됨 */}
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
        ) : tab === "saved" ? (
          <div className="mt-4">
            {savedRecipes.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">{t.noSaved}</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {savedRecipes.map((r, i) => (
                  <Reveal key={r.id} delay={i * 40}>
                    <RecipeCard recipe={r} onToggleSave={toggleSave} onToggleLike={toggleLike} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-100">
            <button
              onClick={toggleLanguage}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-gray-700"
            >
              <span className="flex items-center gap-2">
                <IconLanguage size={16} className="text-gray-400" />
                {t.settingsLanguage}
              </span>
              <span className="text-gray-400">{language === "ko" ? "한국어" : "English"}</span>
            </button>
            <Link
              href="/about"
              className="flex items-center justify-between px-4 py-3 text-sm text-gray-700"
            >
              {t.settingsAbout}
              <IconChevronRight size={16} className="text-gray-300" />
            </Link>
            <Link
              href="/terms"
              className="flex items-center justify-between px-4 py-3 text-sm text-gray-700"
            >
              {t.settingsTerms}
              <IconChevronRight size={16} className="text-gray-300" />
            </Link>
            <Link
              href="/privacy"
              className="flex items-center justify-between px-4 py-3 text-sm text-gray-700"
            >
              {t.settingsPrivacy}
              <IconChevronRight size={16} className="text-gray-300" />
            </Link>
            <Link
              href="/contact"
              className="flex items-center justify-between px-4 py-3 text-sm text-gray-700"
            >
              {t.settingsContact}
              <IconChevronRight size={16} className="text-gray-300" />
            </Link>
            <button className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-500">
              <IconLogout size={16} />
              {t.settingsLogout}
            </button>
            <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-400">
              {t.settingsVersion}
              <span>0.1.0</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function MyPage() {
  return (
    <Suspense fallback={null}>
      <MyPageContent />
    </Suspense>
  );
}
