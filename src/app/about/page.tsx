"use client";

import Link from "next/link";
import { IconArrowLeft, IconChefHat } from "@tabler/icons-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-3">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-600">
          <IconArrowLeft size={16} />
          {t.backToHome}
        </Link>
      </header>

      <main className="mx-auto max-w-md px-4 py-6">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <IconChefHat size={22} />
          </span>
          <h1 className="text-lg font-bold text-gray-900">{t.aboutTitle}</h1>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-gray-700">{t.aboutBody1}</p>
        <p className="mt-3 text-sm leading-relaxed text-gray-700">{t.aboutBody2}</p>

        <Link
          href="/contact"
          className="mt-6 inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          {t.aboutContactCta}
        </Link>
      </main>
    </div>
  );
}
