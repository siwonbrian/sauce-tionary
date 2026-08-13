"use client";

import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { useLanguage } from "@/lib/LanguageContext";

const ARTICLES = [
  {
    title: "제1조 (목적)",
    body: `이 약관은 소스백과(이하 "회사")가 제공하는 소스·레시피 큐레이션 서비스(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 이용 조건 및 절차를 규정함을 목적으로 합니다.`,
  },
  {
    title: "제2조 (정의)",
    body: `"회원"이란 이 약관에 동의하고 이메일 또는 간편 로그인(카카오, 네이버, Apple)으로 가입하여 서비스를 이용하는 자를 말합니다. "게시물"이란 회원이 서비스 내에 게시한 레시피 제보, 리뷰, 팁, 수정 제안 등 일체의 콘텐츠를 말합니다.`,
  },
  {
    title: "제3조 (약관의 효력 및 변경)",
    body: `이 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다. 회사는 필요한 경우 관련 법령을 위반하지 않는 범위에서 이 약관을 변경할 수 있으며, 변경 시 적용일자 및 변경 사유를 명시하여 최소 7일 전에 공지합니다.`,
  },
  {
    title: "제4조 (회원가입 및 이용 제한)",
    body: `회원가입은 이용자가 약관 내용에 동의를 하고 회사가 정한 절차에 따라 가입을 신청하면, 회사가 이를 승인함으로써 체결됩니다. 만 14세 미만은 회원가입을 할 수 없습니다. 이는 개인정보보호법 제22조의2(아동의 개인정보 보호)에 따라 만 14세 미만 아동의 개인정보 처리 시 법정대리인 동의가 필요하기 때문이며, 회사는 별도의 법정대리인 동의 절차를 운영하지 않으므로 가입 자체를 제한합니다.`,
  },
  {
    title: "제5조 (서비스의 내용)",
    body: `회사가 제공하는 서비스는 다음과 같습니다: 소스·레시피 검색 및 조회, 즐겨찾기 및 좋아요, 개인 노트 작성, 레시피 공유, 커뮤니티 레시피 제보 및 수정 제안, 리뷰·팁 게시. 회사는 운영상, 기술상의 필요에 따라 제공하는 서비스의 내용을 변경할 수 있습니다.`,
  },
  {
    title: "제6조 (회원의 의무)",
    body: `회원은 다음 행위를 해서는 안 됩니다: 타인의 정보 도용, 허위 정보 등록, 타인의 저작권 등 지적재산권 침해, 실존 인물의 명예를 훼손하거나 초상권·성명권을 침해하는 게시물 작성, 서비스의 안정적 운영을 방해하는 행위. 레시피를 제보할 때는 반드시 출처를 명시해야 합니다.`,
  },
  {
    title: "제7조 (게시물의 관리)",
    body: `회원이 작성한 게시물의 저작권은 해당 회원에게 있으나, 서비스 노출 및 운영을 위해 회사가 이를 사용할 수 있는 권리를 회원은 회사에 부여합니다. 회사는 게시물이 타인의 권리를 침해하거나 관련 법령에 위반된다고 판단되는 경우, 사전 통지 없이 게시물을 삭제하거나 노출을 제한할 수 있습니다.`,
  },
  {
    title: "제8조 (면책조항)",
    body: `회사가 제공하는 레시피 정보는 회원의 제보 또는 공개된 출처를 참고하여 정리한 것으로, 그 정확성, 안전성, 특정 목적에의 적합성을 보증하지 않습니다. 회원은 조리 시 본인의 알레르기, 건강 상태, 식재료 보관 상태 등을 스스로 확인할 책임이 있으며, 레시피 이용으로 발생한 문제에 대해 회사는 고의 또는 중대한 과실이 없는 한 책임을 지지 않습니다.`,
  },
  {
    title: "제9조 (분쟁해결)",
    body: `이 약관과 관련한 분쟁에 대해서는 대한민국 법을 준거법으로 하며, 관할 법원은 민사소송법에 따른 관할 법원으로 합니다.`,
  },
];

export default function TermsPage() {
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
        <h1 className="text-lg font-bold text-gray-900">이용약관</h1>
        <p className="mt-2 text-xs text-gray-400">
          이 문서는 검토용 초안이며, 법률 자문을 거친 문서가 아닙니다.
        </p>

        <div className="mt-6 space-y-5">
          {ARTICLES.map((a) => (
            <section key={a.title}>
              <h2 className="text-sm font-semibold text-gray-800">{a.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{a.body}</p>
            </section>
          ))}
        </div>

        <p className="mt-8 text-xs text-gray-400">부칙: 이 약관은 202X년 X월 X일부터 시행합니다.</p>
      </main>
    </div>
  );
}
