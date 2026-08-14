import type { CountryTag, FlavorTag, ThemeTag } from "./mockRecipes";

// 카테고리 카드에 쓸 아이콘입니다. 실제 음식 사진 에셋이 아직 없어서 이모지로
// 대체해뒀습니다. 나중에 카테고리별 대표 사진이 생기면 여기 값만 이미지 경로로
// 바꾸고, 이 값을 쓰는 쪽(CategoryCarousel)은 그대로 두면 됩니다.
export const ALL_ICON: string = "🍽️";

export const COUNTRY_ICONS: Record<CountryTag, string> = {
  한식: "🍚",
  중식: "🥟",
  양식: "🍝",
  일식: "🍣",
  멕시칸: "🌮",
};

export const THEME_ICONS: Record<ThemeTag, string> = {
  하이디라오: "🍲",
};

export const FLAVOR_ICONS: Record<FlavorTag, string> = {
  매콤: "🌶️",
  고소: "🥜",
  짭짤: "🧂",
};
