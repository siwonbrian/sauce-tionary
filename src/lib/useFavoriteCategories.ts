"use client";

import { useEffect, useState } from "react";

// 카테고리(요리 종류/테마) 즐겨찾기를 브라우저에 저장하는 훅.
// 로그인 여부와 상관없이 지금 바로 동작하도록 localStorage를 씁니다.
// 나중에 Supabase를 붙이면 이 훅 내부의 저장/조회 부분만 계정 데이터로
// 바꿔치기하면 되고, 훅을 사용하는 화면 쪽 코드는 그대로 두면 됩니다.
const STORAGE_KEY = "sosaekgwa_fav_categories";

// "country:한식", "theme:하이디라오" 처럼 종류를 접두어로 구분해서 저장합니다.
export type FavoriteCategoryKey = string;

function readStoredFavorites(): FavoriteCategoryKey[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FavoriteCategoryKey[]) : [];
  } catch {
    return [];
  }
}

export function useFavoriteCategories() {
  const [favorites, setFavorites] = useState<FavoriteCategoryKey[]>([]);

  // 첫 렌더는 서버/클라이언트 값을 맞추기 위해 빈 배열로 시작하고,
  // 마운트 후에 localStorage 값을 읽어옵니다.
  useEffect(() => {
    setFavorites(readStoredFavorites());
  }, []);

  const toggleFavorite = (key: FavoriteCategoryKey) => {
    setFavorites((prev) => {
      const next = prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const isFavorite = (key: FavoriteCategoryKey) => favorites.includes(key);

  return { favorites, toggleFavorite, isFavorite };
}
