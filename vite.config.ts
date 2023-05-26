import { execSync } from "node:child_process"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import react from "@vitejs/plugin-react"

const commit = execSync("git rev-parse --short HEAD").toString().trim()

// https://vitejs.dev/config/
export default /* @__PURE__ */ defineConfig(({ command }) => ({
  root: process.cwd(),
  build: {
    target: ["chrome120"],
  },
  resolve: {},
  define: {
    "process.env.GIT_COMMIT": `"${commit}"`,
    "process.platform": '"linux"',
    __DEV__: String(command === "serve"),
    __PROD__: String(command === "build"),
  },
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: ["@emotion/babel-plugin"],
      },
    }),
    tsconfigPaths({
      projects: ["./tsconfig.json"],
    }),
  ],
}))
