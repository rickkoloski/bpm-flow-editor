/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--wf-border))",
        input: "hsl(var(--wf-input))",
        ring: "hsl(var(--wf-ring))",
        background: "hsl(var(--wf-background))",
        foreground: "hsl(var(--wf-foreground))",
        primary: {
          DEFAULT: "hsl(var(--wf-primary))",
          foreground: "hsl(var(--wf-primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--wf-secondary))",
          foreground: "hsl(var(--wf-secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--wf-destructive))",
          foreground: "hsl(var(--wf-destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--wf-muted))",
          foreground: "hsl(var(--wf-muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--wf-accent))",
          foreground: "hsl(var(--wf-accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--wf-popover))",
          foreground: "hsl(var(--wf-popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--wf-card))",
          foreground: "hsl(var(--wf-card-foreground))",
        },
        // Node execution state colors
        node: {
          pending: "hsl(var(--wf-node-pending))",
          active: "hsl(var(--wf-node-active))",
          "in-progress": "hsl(var(--wf-node-in-progress))",
          completed: "hsl(var(--wf-node-completed))",
          failed: "hsl(var(--wf-node-failed))",
          waiting: "hsl(var(--wf-node-waiting))",
          blocked: "hsl(var(--wf-node-blocked))",
        },
      },
      borderRadius: {
        lg: "var(--wf-radius)",
        md: "calc(var(--wf-radius) - 2px)",
        sm: "calc(var(--wf-radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "wf-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "wf-subtle-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "wf-pulse": "wf-pulse 2s ease-in-out infinite",
        "wf-subtle-pulse": "wf-subtle-pulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
