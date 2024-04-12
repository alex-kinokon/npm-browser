import { execSync } from "node:child_process"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import react from "@vitejs/plugin-react"
import { getTailwindPlugins } from "@aet/babel-tailwind"
import tailwindConfig from "./tailwind.config"

const tailwind = getTailwindPlugins({
  tailwindConfig,
  clsx: "emotion"
})

const commit = execSync("git rev-parse --short HEAD").toString().trim()

// https://vitejs.dev/config/
export default /* @__PURE__ */ defineConfig(({ command }) => ({
  root: process.cwd(),
  build: {
    target: ["chrome122"],
  },
  // server: {
  //   proxy: {},
  // },
  define: {
    "process.env.GIT_COMMIT": `"${commit}"`,
    "process.platform": '"linux"',
    __DEV__: String(command === "serve"),
    __PROD__: String(command === "build"),
  },
  resolve: {
    alias: {
      "node:path": "@jspm/core/nodelibs/path",
    },
  },
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: ["babel-plugin-macros", "@emotion/babel-plugin", tailwind.babel()],
      },
    }),
    tsconfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwind.vite()
  ],
}))
