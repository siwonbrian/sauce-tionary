"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IconChefHat, IconBookmark, IconSettings, IconX, IconLanguage } from "@tabler/icons-react";
import { useLanguage } from "@/lib/LanguageContext";
import { loggedIn } from "@/lib/auth";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showLoginGate, setShowLoginGate] = useState(false);
  const { t, language, toggleLanguage } = useLanguage();

  const handleSavedClick = () => {
    if (!loggedIn) {
      setShowLoginGate(true);
      return;
    }
    router.push("/mypage/saved");
  };

  // 저장됨/설정을 쿼리(?tab=)가 아니라 서로 다른 경로(/mypage/saved, /mypage/settings)로 분리했습니다.
  // 예전에는 둘 다 "/mypage"로 시작해서 pathname만으로 구분이 안 돼, 저장됨·설정 탭이 동시에
  // 활성(주황색)으로 표시되는 문제가 있었습니다.
  const tabs = [
    { key: "home", href: "/", label: t.navRecipes, icon: IconChefHat, onClick: undefined },
    { key: "saved", href: "/mypage/saved", label: t.navSaved, icon: IconBookmark, onClick: handleSavedClick },
    { key: "settings", href: "/mypage/settings", label: t.navSettings, icon: IconSettings, onClick: undefined },
  ];

  return (
    <>
      {/* 사이트 전역 언어 전환 버튼. 모든 페이지에 공통으로 뜨는 BottomNav에 붙여둬서
          페이지마다 따로 헤더를 건드리지 않고도 어디서나 한/영을 바꿀 수 있게 함. */}
      <button
        onClick={toggleLanguage}
        aria-label="language toggle"
        className="fixed bottom-16 right-3 z-40 flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 shadow-s1"
      >
        <IconLanguage size={14} />
        {language === "ko" ? "EN" : "한국어"}
      </button>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-md">
          {tabs.map(({ key, href, label, icon: Icon, onClick }) => {
            const active = pathname === href;
            const className = `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
              active ? "text-brand-600" : "text-gray-400"
            }`;

            if (onClick) {
              return (
                <button key={key} onClick={onClick} className={className}>
                  <Icon size={22} />
                  <span>{label}</span>
                </button>
              );
            }

            return (
              <Link key={key} href={href} className={className}>
                <Icon size={22} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {showLoginGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative mx-6 w-full max-w-xs rounded-2xl bg-white p-5 text-center shadow-s3">
            <button
              onClick={() => setShowLoginGate(false)}
              aria-label="닫기"
              className="absolute top-2 right-2 text-gray-400"
            >
              <IconX size={18} />
            </button>
            <p className="mt-3 text-sm text-gray-700">{t.loginGateMessage}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowLoginGate(false)}
                className="flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-600"
              >
                {t.close}
              </button>
              <Link
                href="/login"
                className="flex-1 rounded-lg bg-gray-900 py-2 text-sm text-white"
              >
                {t.loginCta}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
