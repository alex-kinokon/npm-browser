// @ts-check
const { execSync } = require("child_process")
const removeImports = require("next-remove-imports")

const lastCommit = execSync("git rev-parse --short HEAD").toString().trim()

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["page.tsx", "page.ts"],
  compiler: {
    emotion: true,
  },
  env: {
    GIT_COMMIT: lastCommit,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.npmjs.com",
        pathname: "/npm-avatar/**",
        port: "",
      },
    ],
  },
}

module.exports = removeImports()(nextConfig)
