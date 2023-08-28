#!/usr/bin/env tsx
import { readFileSync } from "node:fs"
import glob from "fast-glob"
import { camelCase } from "lodash"
import { format } from "prettier"

function parseFile(name: string) {
  const source = readFileSync(`src/pages/api/${name}.ts`, "utf-8")
  const method = source.match(/export const method = "(\w+)";/)?.[1] || "all"
  const raw = source.includes("export const raw = true")
  const middleware = source.includes("export const middleware")
  return { method, middleware, raw }
}

const pages = glob
  .sync(["**/*.page.ts"], { cwd: "src/pages/api" })
  .map(name => name.replace(/\.tsx?$/, ""))
  .map(name => ({
    path: name,
    identifier: camelCase(name.replace(".page", "")),
    route: name
      .replace(/\/index\.[jt]sx?$/, "")
      .replace(/\[(\.\.\.)?(\w+)\]/g, "*")
      .replace(/\[([^\]]+)\]/g, ":$1")
      .replace(/\.page$/, ""),
    ...parseFile(name),
  }))

const code = [
  'import type { FastifyInstance } from "fastify";\n',
  ...pages.map(
    ({ identifier, path, middleware }) =>
      `import ${identifier}${
        middleware ? `, { middleware as ${identifier}Middleware }` : ""
      } from "./${path}";`
  ),
  "\n/**\n * Attach routes to fastify instance.\n *\n * Available routes:",
  ...pages.map(
    ({ route, method }) =>
      ` * - \`${method === "all" ? "* " : `${method} `}/api/${route}\``
  ),
  " */",
  "export async function bindRoutes(app: FastifyInstance) {",
  ...pages.map(({ route, identifier, method, middleware, raw }) =>
    raw
      ? `await ${identifier}(app);`
      : `app.${method.toLowerCase()}("/api/${route}", ${
          middleware ? `${identifier}Middleware, ` : ""
        }${identifier});`
  ),
  "}",
]

console.log(format(code.join("\n"), { parser: "babel-ts" }))
