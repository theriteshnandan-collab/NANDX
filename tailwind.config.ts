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
        // 🔱 SOVEREIGN APEX PALETTE
        // 🧱 SOVEREIGN TACTILE PALETTE
        tactile: {
          canvas: "#F3F4F7",    // Cool Grey Clay
          sage: "#E3F0AF",      // Primary Glass
          steel: "#AABCCE",     // Secondary Glass
          bone: "#F5F0E6",      // Warm Accent
          text: "#2D3436",      // Dark Gunmetal
        },
      },
      boxShadow: {
        // The "Levitation" (Card Surface)
        'levitate': '0 20px 40px -5px rgba(0,0,0,0.05), 0 1px 3px 0 rgba(0,0,0,0.02)',
        // The "Concave" (Inputs)
        'concave': 'inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,1)',
        // The "Convex" (Buttons)
        'convex': '5px 5px 10px rgba(0,0,0,0.05), -5px -5px 10px rgba(255,255,255,0.8)',
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
