import { redirect } from "next/navigation";

// 마이페이지 진입점. 저장됨/설정은 이제 별도 경로(/mypage/saved, /mypage/settings)로
// 나뉘어 있어서, "/mypage"로 바로 들어오면 저장됨 탭으로 보냅니다.
export default function MyPageRedirect() {
  redirect("/mypage/saved");
}
