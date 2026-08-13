import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        danger: { bg: "#FAECE7", text: "#712B13" },
        warning: { bg: "#FAEEDA", text: "#633806" },
        accentc: { bg: "#E6F1FB", text: "#0C447C" },
        success: { bg: "#EAF3DE", text: "#27500A" },
        pro: { bg: "#EEEDFE", text: "#3C3489" },
      },
    },
  },
  plugins: [],
};
export default config;
