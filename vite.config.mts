import { execSync } from "node:child_process"

import { getTailwindPlugins, isMacrosName } from "@aet/tailwind"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

import { assetsDir } from "./src/constants"
import tailwindConfig from "./tailwind.config"

const tailwind = getTailwindPlugins({
  tailwindConfig,
  clsx: "emotion",
  vite: true,
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
  server: {
    proxy: {
      "/npm": "http://localhost:5174",
    },
  },
  resolve: {
    alias: {
      "node:path": "@jspm/core/nodelibs/path",
      module: "@jspm/core/nodelibs/module",
    },
  },
  plugins: [
    tailwind.vite(),
    react({
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: [["babel-plugin-macros", { isMacrosName }], tailwind.babel()],
      },
    }),
    tsconfigPaths({
      projects: ["./tsconfig.json"],
    }),
  ],
}))
