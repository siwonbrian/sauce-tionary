import type { Ingredient } from "./mockRecipes";

export type UnitSystem = "kr" | "us";

const ML_PER_TBSP_US = 14.79;
const ML_PER_TSP_US = 4.93;

// 큰술/작은술은 한국-미국 물리량이 거의 같아서(15ml≈14.79ml, 5ml≈4.93ml) 라벨만 바꿔서 보여줌.
// g(고체·가루)은 재료별 밀도로 ml로 환산한 뒤 tbsp/tsp로 근사 변환하고, 원본 g 값을 항상 괄호로 같이 보여줌.
// ml은 두 방식 모두 그대로 ml로 표기(로드맵에서 정한 방식).
export function formatIngredientAmount(
  ingredient: Ingredient,
  system: UnitSystem
): string {
  const { amount, unit } = ingredient;

  if (unit === "큰술" || unit === "작은술") {
    if (system === "kr") return `${amount}${unit}`;
    return `${amount} ${unit === "큰술" ? "tbsp" : "tsp"}`;
  }

  if (unit === "ml") {
    return `${amount}ml`;
  }

  // unit === "g"
  if (system === "kr") return `${amount}g`;

  const density = ingredient.densityGPerMl ?? 1; // 밀도 미등록 재료는 물(1g/ml) 기준 근사치
  const ml = amount / density;
  const tbsp = ml / ML_PER_TBSP_US;

  // 근사치라는 건 재료 목록 아래 별도 안내 문구로 이미 설명하므로,
  // 값 자체에는 "약"처럼 언어에 매인 접두어를 붙이지 않음.
  let approx: string;
  if (tbsp >= 1) {
    approx = `${round(tbsp, 1)} tbsp`;
  } else {
    const tsp = ml / ML_PER_TSP_US;
    approx = `${round(tsp, 1)} tsp`;
  }
  return `${approx} (${amount}g)`;
}

function round(n: number, digits: number) {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}
