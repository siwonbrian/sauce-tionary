"use client";

import { useCallback, useEffect, useState } from "react";

// 아직 Supabase(실제 서버) 연동 전이라, 조회수는 이 브라우저(로컬스토리지)에서만
// 집계되는 임시 카운터입니다. 레시피별 기준값(MockRecipe.viewCount, 지금은 0)에
// 이 값을 더해서 화면에 보여줍니다. 나중에 실제 서버 집계로 바꿀 때는 이 훅 내부만
// API 호출로 교체하면 되고, 사용하는 쪽(컴포넌트) 코드는 그대로 둬도 됩니다.
const STORAGE_KEY = "sosaekgwa_view_counts";

type ViewCounts = Record<string, number>;

function readStoredViewCounts(): ViewCounts {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function useViewCounts() {
  const [viewCounts, setViewCounts] = useState<ViewCounts>({});

  useEffect(() => {
    setViewCounts(readStoredViewCounts());
  }, []);

  // 레시피 상세 페이지 방문 시 1회 호출하는 조회수 증가 함수
  const recordView = useCallback((recipeId: string) => {
    setViewCounts((prev) => {
      const next = { ...prev, [recipeId]: (prev[recipeId] ?? 0) + 1 };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const getViewCount = useCallback(
    (recipeId: string, baseCount: number) => baseCount + (viewCounts[recipeId] ?? 0),
    [viewCounts]
  );

  return { viewCounts, recordView, getViewCount };
}
