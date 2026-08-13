// 실제 데이터 연결(Supabase) 전까지 화면 확인용으로 쓰는 예시 데이터입니다.
// recipes 테이블 구조(id, slug, name, tags 등)에 맞춰 임시로 만든 목데이터이며,
// 실제 레시피 출처/내용이 아닙니다.
//
// 언어 토글(한국어/영어) 지원을 위해 nameEn / celebrityNameEn / ingredients[].nameEn /
// instructionsEn / sourceNameEn 필드를 함께 둡니다. 실제 서비스에서는 recipes 테이블에
// 같은 이름의 컬럼(또는 translations 서브테이블)으로 옮기면 됩니다.

export type FlavorTag = "매콤" | "고소" | "짭짤";
export type CountryTag = "한식" | "중식" | "양식" | "일식" | "멕시칸";

export type IngredientUnit = "큰술" | "작은술" | "ml" | "g";

export interface Ingredient {
  name: string;
  nameEn: string;
  amount: number;
  unit: IngredientUnit;
  densityGPerMl?: number; // g 단위 재료의 US 환산용 밀도(g/ml). 없으면 물 기준(1) 근사치 사용
}

export interface MockRecipe {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  flavor: FlavorTag;
  country: CountryTag;
  celebrityName?: string; // 예: "건희" -> 제목에 "건희가 소개한 ~"로 표시 + #건희 해시태그(검색용) 병행
  celebrityNameEn?: string; // 영어 화면용 로마자 표기 (예: "Geonhui")
  spiceLevel: number; // 0(순함) ~ 3(제일 매움). 벤치마킹(saucepick.com) 후 추가
  photoUrl?: string; // 완성 사진(공개용). 아직 실제 업로드 기능 전이라 목데이터에는 없음 -> 빈 값이면 사진 자리에 아이콘만 표시
  likeCount: number;
  liked: boolean; // 로그인 사용자가 좋아요 눌렀는지 (지금은 목데이터라 고정값)
  createdAt: string; // ISO date
  saved: boolean; // 로그인 사용자의 즐겨찾기 여부 (지금은 목데이터라 고정값)
  ingredients: Ingredient[];
  instructions: string; // 조리 순서(간단 설명)
  instructionsEn: string;
  sourceUrl: string;
  sourceName: string;
  sourceNameEn: string;
}

export const mockRecipes: MockRecipe[] = [
  {
    id: "1",
    slug: "mala-hotpot-sauce",
    name: "마라 훠궈 소스",
    nameEn: "Mala Hotpot Sauce",
    flavor: "매콤",
    country: "중식",
    spiceLevel: 1,
    celebrityName: "건희",
    celebrityNameEn: "Geonhui",
    likeCount: 128,
    createdAt: "2026-07-20",
    saved: true,
    liked: false,
    ingredients: [
      { name: "땅콩소스", nameEn: "Peanut sauce", amount: 1, unit: "큰술" },
      { name: "칠리소스", nameEn: "Chili sauce", amount: 2, unit: "큰술" },
      { name: "다진마늘", nameEn: "Minced garlic", amount: 0.5, unit: "큰술" },
      { name: "참깨", nameEn: "Sesame seeds", amount: 1, unit: "작은술" },
      { name: "고추기름", nameEn: "Chili oil", amount: 0.5, unit: "큰술" },
      { name: "설탕", nameEn: "Sugar", amount: 15, unit: "g", densityGPerMl: 0.85 },
    ],
    instructions: "모든 재료를 볼에 넣고 골고루 섞어주세요. 매운 정도는 칠리소스 양으로 조절합니다.",
    instructionsEn:
      "Combine all ingredients in a bowl and mix well. Adjust the spice level by changing the amount of chili sauce.",
    sourceUrl: "https://x.com/example_source1",
    sourceName: "X(트위터) 공개 게시물",
    sourceNameEn: "Public post on X (Twitter)",
  },
  {
    id: "2",
    slug: "ssamjang-style-sauce",
    name: "쌈장 스타일 소스",
    nameEn: "Ssamjang-Style Sauce",
    flavor: "짭짤",
    country: "한식",
    spiceLevel: 1,
    likeCount: 96,
    createdAt: "2026-07-18",
    saved: true,
    liked: false,
    ingredients: [
      { name: "쌈장", nameEn: "Ssamjang (soybean paste)", amount: 2, unit: "큰술" },
      { name: "참기름", nameEn: "Sesame oil", amount: 1, unit: "큰술" },
      { name: "다진마늘", nameEn: "Minced garlic", amount: 0.5, unit: "큰술" },
      { name: "참깨", nameEn: "Sesame seeds", amount: 1, unit: "작은술" },
      { name: "설탕", nameEn: "Sugar", amount: 5, unit: "g", densityGPerMl: 0.85 },
    ],
    instructions: "재료를 골고루 섞고 냉장 보관 후 찍어 드세요.",
    instructionsEn: "Mix the ingredients well, refrigerate, and use as a dip.",
    sourceUrl: "https://x.com/example_source2",
    sourceName: "X(트위터) 공개 게시물",
    sourceNameEn: "Public post on X (Twitter)",
  },
  {
    id: "3",
    slug: "peanut-sesame-sauce",
    name: "땅콩깨 소스",
    nameEn: "Peanut Sesame Sauce",
    flavor: "고소",
    country: "중식",
    spiceLevel: 1,
    celebrityName: "이영지",
    celebrityNameEn: "Lee Young-ji",
    likeCount: 210,
    createdAt: "2026-07-15",
    saved: false,
    liked: false,
    ingredients: [
      { name: "땅콩소스", nameEn: "Peanut sauce", amount: 2, unit: "큰술" },
      { name: "참깨", nameEn: "Sesame seeds", amount: 1, unit: "큰술" },
      { name: "간장", nameEn: "Soy sauce", amount: 1, unit: "큰술" },
      { name: "설탕", nameEn: "Sugar", amount: 10, unit: "g", densityGPerMl: 0.85 },
      { name: "식초", nameEn: "Vinegar", amount: 1, unit: "작은술" },
    ],
    instructions: "땅콩소스와 간장을 먼저 섞은 뒤 나머지 재료를 넣고 잘 저어줍니다.",
    instructionsEn:
      "Mix the peanut sauce and soy sauce first, then add the remaining ingredients and stir well.",
    sourceUrl: "https://x.com/example_source3",
    sourceName: "X(트위터) 공개 게시물",
    sourceNameEn: "Public post on X (Twitter)",
  },
  {
    id: "4",
    slug: "yuzu-ponzu-sauce",
    name: "유자폰즈 소스",
    nameEn: "Yuzu Ponzu Sauce",
    flavor: "짭짤",
    country: "일식",
    spiceLevel: 0,
    likeCount: 74,
    createdAt: "2026-07-22",
    saved: false,
    liked: false,
    ingredients: [
      { name: "유자청", nameEn: "Yuzu syrup", amount: 1, unit: "큰술" },
      { name: "간장", nameEn: "Soy sauce", amount: 2, unit: "큰술" },
      { name: "식초", nameEn: "Vinegar", amount: 1, unit: "큰술" },
      { name: "다시마육수", nameEn: "Kelp broth", amount: 30, unit: "ml" },
    ],
    instructions: "모든 재료를 섞어 냉장고에 10분 정도 두었다가 사용하면 더 어울립니다.",
    instructionsEn:
      "Mix all ingredients and let sit in the fridge for about 10 minutes for the best flavor.",
    sourceUrl: "https://x.com/example_source4",
    sourceName: "X(트위터) 공개 게시물",
    sourceNameEn: "Public post on X (Twitter)",
  },
  {
    id: "5",
    slug: "gochujang-mayo-sauce",
    name: "고추장 마요 소스",
    nameEn: "Gochujang Mayo Sauce",
    flavor: "매콤",
    country: "한식",
    spiceLevel: 2,
    celebrityName: "김풍",
    celebrityNameEn: "Kim Poong",
    likeCount: 156,
    createdAt: "2026-07-10",
    saved: true,
    liked: false,
    ingredients: [
      { name: "고추장", nameEn: "Gochujang", amount: 1, unit: "큰술" },
      { name: "마요네즈", nameEn: "Mayonnaise", amount: 2, unit: "큰술" },
      { name: "설탕", nameEn: "Sugar", amount: 10, unit: "g", densityGPerMl: 0.85 },
      { name: "식초", nameEn: "Vinegar", amount: 1, unit: "작은술" },
    ],
    instructions: "고추장과 마요네즈를 먼저 섞은 뒤 설탕과 식초로 간을 맞춥니다.",
    instructionsEn:
      "Mix the gochujang and mayonnaise first, then season with sugar and vinegar to taste.",
    sourceUrl: "https://x.com/example_source5",
    sourceName: "X(트위터) 공개 게시물",
    sourceNameEn: "Public post on X (Twitter)",
  },
  {
    id: "6",
    slug: "salsa-verde-sauce",
    name: "살사 베르데 소스",
    nameEn: "Salsa Verde Sauce",
    flavor: "매콤",
    country: "멕시칸",
    spiceLevel: 2,
    likeCount: 41,
    createdAt: "2026-07-05",
    saved: false,
    liked: false,
    ingredients: [
      { name: "다진 할라피뇨", nameEn: "Minced jalapeño", amount: 1, unit: "큰술" },
      { name: "다진 고수", nameEn: "Minced cilantro", amount: 1, unit: "큰술" },
      { name: "라임즙", nameEn: "Lime juice", amount: 1, unit: "큰술" },
      { name: "올리브유", nameEn: "Olive oil", amount: 2, unit: "큰술" },
      { name: "소금", nameEn: "Salt", amount: 3, unit: "g", densityGPerMl: 1.2 },
    ],
    instructions: "모든 재료를 잘게 다져 섞고 라임즙과 소금으로 간을 맞춥니다.",
    instructionsEn: "Finely chop and mix all ingredients, then season with lime juice and salt.",
    sourceUrl: "https://x.com/example_source6",
    sourceName: "X(트위터) 공개 게시물",
    sourceNameEn: "Public post on X (Twitter)",
  },
  {
    id: "7",
    slug: "garlic-butter-sauce",
    name: "갈릭버터 소스",
    nameEn: "Garlic Butter Sauce",
    flavor: "고소",
    country: "양식",
    spiceLevel: 0,
    celebrityName: "샤오쥔",
    celebrityNameEn: "Xiaojun",
    likeCount: 187,
    createdAt: "2026-07-23",
    saved: true,
    liked: false,
    ingredients: [
      { name: "버터", nameEn: "Butter", amount: 20, unit: "g", densityGPerMl: 0.9 },
      { name: "다진마늘", nameEn: "Minced garlic", amount: 1, unit: "큰술" },
      { name: "파슬리", nameEn: "Parsley", amount: 1, unit: "작은술" },
      { name: "소금", nameEn: "Salt", amount: 2, unit: "g", densityGPerMl: 1.2 },
    ],
    instructions: "버터를 약불에 녹인 뒤 다진마늘을 넣고 향이 올라오면 소금과 파슬리로 마무리합니다.",
    instructionsEn:
      "Melt the butter over low heat, add the minced garlic, and once fragrant, finish with salt and parsley.",
    sourceUrl: "https://x.com/example_source7",
    sourceName: "X(트위터) 공개 게시물",
    sourceNameEn: "Public post on X (Twitter)",
  },
  {
    id: "8",
    slug: "sesame-soy-sauce",
    name: "참깨간장 소스",
    nameEn: "Sesame Soy Sauce",
    flavor: "짭짤",
    country: "일식",
    spiceLevel: 1,
    likeCount: 63,
    createdAt: "2026-07-12",
    saved: false,
    liked: false,
    ingredients: [
      { name: "간장", nameEn: "Soy sauce", amount: 2, unit: "큰술" },
      { name: "참기름", nameEn: "Sesame oil", amount: 1, unit: "큰술" },
      { name: "참깨", nameEn: "Sesame seeds", amount: 1, unit: "큰술" },
      { name: "식초", nameEn: "Vinegar", amount: 1, unit: "작은술" },
      { name: "설탕", nameEn: "Sugar", amount: 5, unit: "g", densityGPerMl: 0.85 },
    ],
    instructions: "모든 재료를 섞어 냉장 보관하고, 찍먹 소스로 사용합니다.",
    instructionsEn: "Mix all ingredients, refrigerate, and use as a dipping sauce.",
    sourceUrl: "https://x.com/example_source8",
    sourceName: "X(트위터) 공개 게시물",
    sourceNameEn: "Public post on X (Twitter)",
  },
];
