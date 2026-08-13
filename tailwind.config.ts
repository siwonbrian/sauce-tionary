import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 아래 colors/fontSize/borderRadius/boxShadow 값은 SEED 디자인 시스템
      // (seed-design.io, Apache-2.0 라이선스, 당근마켓)의 Foundations 문서에
      // 공개된 토큰 값을 그대로 옮긴 것입니다.
      // - Color: seed-design.io/foundations/color/palette, color-role
      // - Typography: seed-design.io/foundations/typography
      // - Radius: seed-design.io/foundations/radius
      // - Elevation(Shadow): seed-design.io/foundations/elevation
      colors: {
        danger: { bg: "#FAECE7", text: "#712B13" },
        warning: { bg: "#FAEEDA", text: "#633806" },
        accentc: { bg: "#E6F1FB", text: "#0C447C" },
        success: { bg: "#EAF3DE", text: "#27500A" },
        pro: { bg: "#EEEDFE", text: "#3C3489" },
        // $color.palette.carrot-* : 브랜드(강조) 색상. 사이트 포인트 컬러로 사용.
        brand: {
          100: "#fff2ec",
          200: "#ffe8db",
          300: "#ffd5c0",
          400: "#ffb999",
          500: "#ff9364",
          600: "#ff6600",
          700: "#e14d00",
          800: "#b93901",
          900: "#862b00",
          1000: "#471601",
          DEFAULT: "#ff6600",
        },
        // $color.palette.gray-* : 중립 색상 스케일
        seedgray: {
          0: "#ffffff",
          100: "#f7f8f9",
          200: "#f3f4f5",
          300: "#eeeff1",
          400: "#dcdee3",
          500: "#d1d3d8",
          600: "#b0b3ba",
          700: "#868b94",
          800: "#555d6d",
          900: "#2a3038",
          1000: "#1a1c20",
        },
      },
      fontFamily: {
        // seed-design.io/foundations/typography 에 명시된 시스템 폰트 스택
        sand: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Apple SD Gothic Neo",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "sans-serif",
        ],
      },
      borderRadius: {
        // $radius.* 토큰
        "seed-1": "4px",
        "seed-1_5": "6px",
        "seed-2": "8px",
        "seed-2_5": "10px",
        "seed-3": "12px",
        "seed-4": "16px",
      },
      boxShadow: {
        // $shadow.* 토큰 (elevation)
        s1: "0px 1px 4px 0px #00000014",
        s2: "0px 2px 10px 0px #0000001a",
        s3: "0px 4px 16px 0px #0000001f",
      },
    },
  },
  plugins: [],
};
export default config;
