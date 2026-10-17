import type { Config } from "tailwindcss";
import { tailwindPreset } from "@afritrade/ui/tailwind.preset";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  presets: [tailwindPreset as Config],
  darkMode: "class" as any,
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [tailwindcssAnimate],
};

export default config;
