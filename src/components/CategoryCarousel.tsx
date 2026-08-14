"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";

export interface CarouselItem {
  key: string;
  emoji: string;
  label: string;
}

// 배달앱(배민 등)의 상단 카테고리 탭 + "전체보기" 패턴을 참고한 가로 스크롤
// 카테고리 선택 컴포넌트입니다. 모바일은 네이티브 터치 스크롤, PC는 좌우 화살표
// 버튼으로 넘기고, 화살표 옆 아래 화살표 버튼을 누르면 전체 목록이 그리드로
// 펼쳐집니다. 즐겨찾기(별표)한 항목은 가로 스크롤 순서에서 맨 앞으로 옵니다.
export default function CategoryCarousel({
  items,
  allItem,
  activeKey,
  isFavorite,
  onToggleFavorite,
  onSelect,
  favoriteHint,
  trailing,
}: {
  items: CarouselItem[];
  allItem: CarouselItem;
  activeKey: string;
  isFavorite: (key: string) => boolean;
  onToggleFavorite: (key: string) => void;
  onSelect: (key: string) => void;
  favoriteHint: string;
  // 정렬 버튼처럼 캐러셀과 같은 줄에 함께 넣고 싶은 요소 (B안: 필터를 한 군데로 모으기용)
  trailing?: ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);

  useEffect(() => {
    if (!expanded) {
      setPanelVisible(false);
      return;
    }
    const raf = requestAnimationFrame(() => setPanelVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [expanded]);

  // 즐겨찾기한 항목만 앞으로 오도록 정렬 (그리드에서는 원래 순서를 그대로 둬서
  // "전체보기"에서는 항상 예측 가능한 순서로 찾을 수 있게 함)
  const carouselItems = [...items].sort((a, b) => {
    const favA = isFavorite(a.key) ? 0 : 1;
    const favB = isFavorite(b.key) ? 0 : 1;
    return favA - favB;
  });

  const scrollByAmount = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 220, behavior: "smooth" });
  };

  const renderCard = (item: CarouselItem, active: boolean, showFavorite: boolean) => (
    <button
      key={item.key}
      onClick={() => onSelect(item.key)}
      className="flex flex-shrink-0 flex-col items-center gap-1"
    >
      <span
        className={`relative flex h-14 w-14 items-center justify-center rounded-full text-2xl transition-all duration-150 ${
          active ? "bg-brand-100 ring-2 ring-brand-500" : "bg-gray-100"
        }`}
      >
        {item.emoji}
        {showFavorite && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(item.key);
            }}
            className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-s1"
          >
            {isFavorite(item.key) ? (
              <IconStarFilled size={10} className="text-brand-500" />
            ) : (
              <IconStar size={10} className="text-gray-300" />
            )}
          </span>
        )}
      </span>
      <span
        className={`w-14 truncate text-center text-xs ${
          active ? "font-semibold text-gray-900" : "text-gray-600"
        }`}
      >
        {item.label}
      </span>
    </button>
  );

  return (
    <div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => scrollByAmount(-1)}
          aria-label="scroll left"
          className="hidden h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500 sm:flex"
        >
          <IconChevronLeft size={14} />
        </button>

        <div
          ref={scrollRef}
          className="no-scrollbar flex flex-1 gap-3 overflow-x-auto scroll-smooth px-1 py-1"
        >
          {renderCard(allItem, activeKey === allItem.key, false)}
          {carouselItems.map((item) => renderCard(item, activeKey === item.key, true))}
        </div>

        <button
          onClick={() => scrollByAmount(1)}
          aria-label="scroll right"
          className="hidden h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500 sm:flex"
        >
          <IconChevronRight size={14} />
        </button>

        <button
          onClick={() => setExpanded((v) => !v)}
          aria-label="toggle all categories"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500"
        >
          <IconChevronDown
            size={14}
            className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        {trailing}
      </div>

      {expanded && (
        <div
          className={`mt-2 overflow-hidden transition-all duration-200 ease-[cubic-bezier(0.03,0.4,0.1,1)] ${
            panelVisible ? "max-h-[28rem] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <p className="px-1 text-xs text-gray-400">{favoriteHint}</p>
          <div className="mt-2 grid grid-cols-4 gap-y-3 rounded-xl border border-gray-100 p-3 sm:grid-cols-5">
            {renderCard(allItem, activeKey === allItem.key, false)}
            {items.map((item) => renderCard(item, activeKey === item.key, true))}
          </div>
        </div>
      )}
    </div>
  );
}
