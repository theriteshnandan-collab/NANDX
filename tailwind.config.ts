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
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        // 🌙 LUNAR GLASS PALETTE
        lunar: {
          canvas: "#FAFBFE",
          midnight: "#0F0F1A",
          slate: "#64748B",
          silver: "#94A3B8",
          frost: "#E2E8F0",
          mint: "#ECFDF5",
          lavender: "#EDE9FE",
        },
        // 🔱 SOVEREIGN TACTILE PALETTE (legacy compatibility)
        tactile: {
          canvas: "#FAFBFE",
          sage: "#E3F0AF",
          steel: "#AABCCE",
          bone: "#F5F0E6",
          text: "#0F0F1A",
          leaf: "#64748B",
        },
      },
      boxShadow: {
        'levitate': '0 20px 40px rgba(0,0,0,0.06), 0 8px 16px rgba(0,0,0,0.04)',
        'concave': 'inset 0 2px 4px rgba(0,0,0,0.06)',
        'convex': '0 4px 12px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        mono: ["var(--font-jetbrains-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;
