"use client";

import Link from "next/link";
import { IconArrowLeft, IconMail } from "@tabler/icons-react";
import { useLanguage } from "@/lib/LanguageContext";

// 문의 이메일 주소가 아직 정해지지 않아 자리표시자로 남겨뒀습니다.
// 도메인을 연결하신 뒤 contact@ 형태의 실제 주소로 바꿔주세요.
const CONTACT_EMAIL = "[문의 이메일 주소]";

export default function ContactPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-3">
        <Link href="/" className="flex items-center gap-1 text-sm text-gray-600">
          <IconArrowLeft size={16} />
          {t.backToHome}
        </Link>
      </header>

      <main className="mx-auto max-w-md px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900">문의하기</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          소스백과 이용 중 궁금한 점, 레시피 오류 제보, 저작권 관련 문의는 아래 이메일로 연락해주세요.
          영업일 기준 3일 이내에 답변드립니다.
        </p>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3">
          <IconMail size={18} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-800">{CONTACT_EMAIL}</span>
        </div>

        <p className="mt-3 text-xs text-gray-400">
          저작권·초상권 관련 삭제 요청도 위 이메일로 받습니다.
        </p>
      </main>
    </div>
  );
}
