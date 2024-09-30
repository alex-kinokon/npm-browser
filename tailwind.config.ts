import type { Config } from "tailwindcss"
import plugin from "tailwindcss/plugin"

export default {
  darkMode: ["selector", ".bp5-dark"],
  content: [],
  theme: {
    extend: {
      fontFamily: {
        narrow: [
          "SF Compact",
          "Chaloult Condensed",
          "Roboto Condensed Variable",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant("light", ".bp5-light &")
    }),
  ],
} satisfies Config
