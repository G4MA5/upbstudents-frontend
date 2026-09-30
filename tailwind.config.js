/** @type {import('tailwindcss').Config} */
// Every themed value points to a design token of src/index.css, so light
// and dark mode (and any future change) are handled in one place.
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      screens: {
        xs: "400px",
      },
      colors: {
        // Institutional orange (logo #F47B20). 700 meets AA with white text.
        brand: {
          50: "#FFF4EC",
          100: "#FFE6D2",
          200: "#FFCBA4",
          300: "#FFA866",
          400: "#FB8B3A",
          500: "#F47B20",
          600: "#E0650C",
          700: "#C94F00",
          800: "#A43F05",
          900: "#7F3209",
        },
        // Institutional blue (the "U" of the logo, #053251).
        navy: {
          50: "#EEF4F9",
          100: "#D6E3EE",
          200: "#ADC6DC",
          300: "#7FA3C2",
          400: "#4D7BA3",
          500: "#265A85",
          600: "#174769",
          700: "#0D3A5C",
          800: "#053251",
          900: "#04253D",
        },
        primary: {
          DEFAULT: v("color-primary"),
          hover: v("color-primary-hover"),
          active: v("color-primary-active"),
          soft: v("color-primary-soft"),
        },
        secondary: {
          DEFAULT: v("color-secondary"),
          hover: v("color-secondary-hover"),
          text: v("color-secondary-text"),
          soft: v("color-secondary-soft"),
        },
        // Themed neutrals (short names used across the components).
        canvas: v("color-background"),
        card: v("color-surface"),
        elevated: v("color-surface-elevated"),
        sunken: v("color-surface-sunken"),
        line: { DEFAULT: v("color-border"), strong: v("color-border-strong") },
        ink: {
          DEFAULT: v("color-text"),
          soft: v("color-text-secondary"),
          muted: v("color-text-muted"),
          faint: v("color-text-faint"),
        },
        accent: { DEFAULT: v("color-accent"), soft: v("color-primary-soft") },
        success: v("color-success"),
        warning: v("color-warning"),
        danger: v("color-error"),
        // Fixed dark surface (independent of the theme).
        night: { DEFAULT: "#17171A", soft: "#232327", line: "#34343A" },
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      // Same 8 / 12 / 16 / 24 scale as before, now tokenized.
      borderRadius: {
        lg: "var(--radius-sm)",
        xl: "var(--radius-md)",
        "2xl": "var(--radius-lg)",
        "3xl": "var(--radius-xl)",
      },
      boxShadow: {
        card: "var(--shadow-sm)",
        raised: "var(--shadow-md)",
        elevated: "var(--shadow-lg)",
        cover: "0 10px 24px -10px rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.08)",
        glow: "0 10px 24px -8px rgba(244,123,32,0.55)",
      },
      // Motion tokens: `transition` alone uses the micro duration and the
      // standard curve, so every hover/press behaves the same way.
      transitionDuration: {
        DEFAULT: "var(--duration-micro)",
        micro: "var(--duration-micro)",
        standard: "var(--duration-standard)",
        large: "var(--duration-large)",
      },
      transitionTimingFunction: {
        DEFAULT: "var(--ease-out)",
        out: "var(--ease-out)",
        in: "var(--ease-in)",
      },
      keyframes: {
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: {
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};
