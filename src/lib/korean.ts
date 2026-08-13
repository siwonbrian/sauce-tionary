// 한글 이름 마지막 글자에 받침이 있으면 "이", 없으면 "가"를 붙임 (예: 김풍이, 건희가)
export function subjectParticle(name: string): "이" | "가" {
  const lastChar = name[name.length - 1];
  const code = lastChar.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return "가"; // 한글이 아니면 기본값
  const hasBatchim = code % 28 !== 0;
  return hasBatchim ? "이" : "가";
}
