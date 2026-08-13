"use client";

import Link from "next/link";
import {
  IconArrowLeft,
  IconChevronRight,
  IconLanguage,
  IconLogin,
  IconLogout,
} from "@tabler/icons-react";
import { useLanguage } from "@/lib/LanguageContext";
import { loggedIn } from "@/lib/auth";

export default function SettingsPage() {
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-3">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-600">
          <IconArrowLeft size={16} />
          {t.backToHome}
        </Link>
      </header>

      <main className="mx-auto max-w-md px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900">{t.navSettings}</h1>

        {/* 설정은 언어 변경, 소개, 약관 등 계정 없이도 쓸 수 있는 항목이 대부분이라
            로그인 여부와 상관없이 항상 보여줍니다. 로그인/로그아웃만 맨 위 한 줄로 분기. */}
        <div className="mt-4 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-100">
          {loggedIn ? (
            <button className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-500">
              <IconLogout size={16} />
              {t.settingsLogout}
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-3 text-sm text-brand-600"
            >
              <IconLogin size={16} />
              {t.loginCta}
            </Link>
          )}

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
          <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-400">
            {t.settingsVersion}
            <span>0.1.0</span>
          </div>
        </div>
      </main>
    </div>
  );
}
