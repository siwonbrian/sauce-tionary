"use client";

import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { useLanguage } from "@/lib/LanguageContext";

const SECTIONS = [
  {
    title: "1. 수집하는 개인정보 항목",
    body: [
      "회원가입 시: 닉네임, 이메일, 비밀번호(암호화 저장), 생년월일(만 14세 미만 가입 제한 확인용)",
      "간편 로그인(카카오·네이버·Apple) 이용 시: 각 서비스가 제공하는 식별자, 이메일",
      "서비스 이용 과정에서 자동 생성: 즐겨찾기·좋아요 기록, 개인 노트 내용, 접속 로그, 쿠키",
      "커뮤니티 기능(2단계) 이용 시: 레시피 제보 내용, 리뷰·팁 작성 내용",
    ],
  },
  {
    title: "2. 개인정보의 수집 방법",
    body: ["회원가입 및 간편 로그인 과정에서 직접 수집하며, 서비스 이용 과정에서 쿠키를 통해 자동으로 수집되는 정보가 있습니다."],
  },
  {
    title: "3. 개인정보의 이용 목적",
    body: ["회원 관리(본인 확인, 만 14세 미만 가입 제한), 즐겨찾기·개인 노트 등 서비스 제공, 부정 이용 방지, 서비스 개선을 위한 통계 분석에 이용합니다."],
  },
  {
    title: "4. 개인정보의 보유 및 이용 기간",
    body: ["회원 탈퇴 시까지 보유하며, 탈퇴 시 지체 없이 파기합니다. 다만 관계 법령에 따라 보존이 필요한 정보(예: 전자상거래법상 소비자 불만 및 분쟁처리 기록)는 관련 법령이 정한 기간 동안 별도 보관합니다."],
  },
  {
    title: "5. 개인정보의 제3자 제공 및 광고 쿠키",
    body: ["회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만 이 사이트는 Google 애드센스 등 광고 서비스를 이용할 수 있으며, Google을 비롯한 제3자 공급업체는 쿠키를 사용하여 이용자의 사이트 방문 기록을 기반으로 광고를 게재할 수 있습니다. 이용자는 Google 광고 설정 페이지(adssettings.google.com)에서 맞춤 광고를 거부할 수 있습니다."],
  },
  {
    title: "6. 이용자의 권리",
    body: ["이용자는 언제든지 본인의 개인정보를 열람, 정정, 삭제할 것을 요구할 수 있으며, 마이페이지의 회원 탈퇴 기능을 통해 동의를 철회할 수 있습니다."],
  },
  {
    title: "7. 개인정보 보호책임자 및 문의처",
    body: ["개인정보 관련 문의는 [문의 이메일 주소]로 연락해주시기 바랍니다."],
  },
  {
    title: "8. 방침의 변경",
    body: ["이 방침은 법령, 정책 또는 서비스 내용의 변화에 따라 개정될 수 있으며, 개정 시 서비스 내 공지사항을 통해 사전에 안내합니다."],
  },
];

export default function PrivacyPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-3">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-600">
          <IconArrowLeft size={16} />
          {t.backToHome}
        </Link>
      </header>

      <main className="mx-auto max-w-md px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900">개인정보처리방침</h1>
        <p className="mt-2 text-xs text-gray-400">
          이 문서는 검토용 초안이며, 새로운 기능이 추가될 때마다 수집 항목을 다시 확인해 갱신합니다.
        </p>

        <div className="mt-6 space-y-5">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="text-sm font-semibold text-gray-800">{s.title}</h2>
              {s.body.length > 1 ? (
                <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm leading-relaxed text-gray-600">
                  {s.body.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{s.body[0]}</p>
              )}
            </section>
          ))}
        </div>

        <p className="mt-8 text-xs text-gray-400">시행일: 202X년 X월 X일</p>
      </main>
    </div>
  );
}
