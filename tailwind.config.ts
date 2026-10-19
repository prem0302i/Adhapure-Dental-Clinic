import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#12263F",
          soft: "#2B3F57",
        },
        teal: {
          DEFAULT: "#1A8C8C",
          deep: "#0F6B6E",
          tint: "#E3F2F1",
        },
        enamel: "#F5F9F8",
        line: "#DCE5E6",
        muted: "#55677A",
      },
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["Figtree", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "1152px",
      },
      borderRadius: {
        pill: "9999px",
      },
      minHeight: {
        tap: "44px",
      },
      keyframes: {
        "smile-draw": {
          to: { strokeDashoffset: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "smile-draw": "smile-draw 1.4s ease-out 0.3s forwards",
        "fade-up": "fade-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
} satisfies Config;
