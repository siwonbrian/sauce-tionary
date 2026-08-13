"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// 요소가 화면에 들어올 때 부드럽게 나타나는 스크롤 리벨 효과.
// 무거운 스크롤 라이브러리 없이 IntersectionObserver만으로 처리해서
// 번들 크기·모바일 성능에 영향이 거의 없음.
// 타이밍은 SEED 디자인 시스템(seed-design.io)의 Motion 토큰 값을 따름:
// duration = $duration.d6(300ms), easing = $timing-function.enter
// (요소가 나타나는 매크로 모션용 커브, cubic-bezier(0,0,0.15,1)).
// prefers-reduced-motion이면 Tailwind의 motion-reduce: 접두사로 애니메이션을 끔.
export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      className={`transition-all duration-300 ease-[cubic-bezier(0,0,0.15,1)] motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
    >
      {children}
    </div>
  );
}
