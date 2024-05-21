import { execSync } from "node:child_process"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import react from "@vitejs/plugin-react"
import { getTailwindPlugins } from "@aet/tailwind"
import tailwindConfig from "./tailwind.config"
import { assetsDir } from "./src/constants"

const tailwind = getTailwindPlugins({
  tailwindConfig,
  clsx: "emotion",
})

// https://vitejs.dev/config/
export default /* @__PURE__ */ defineConfig(({ command, mode }) => ({
  root: process.cwd(),
  build: {
    target: ["chrome122"],
    assetsDir,
  },
  define: {
    "process.env.GIT_COMMIT":
      mode === "test"
        ? '""'
        : `"${execSync("git rev-parse --short HEAD").toString().trim()}"`,
    __DEV__: String(command === "serve"),
    __PROD__: String(command === "build"),
    ...(mode !== "test" && {
      "process.platform": '"linux"',
    }),
  },
  resolve: {
    alias: {
      "node:path": "@jspm/core/nodelibs/path",
      module: "@jspm/core/nodelibs/module",
    },
  },
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: [
          "babel-plugin-macros",
          "@emotion/babel-plugin",
          tailwind.babel(),
        ],
      },
    }),
    tsconfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwind.vite(),
  ],
}))
