#!/usr/bin/env tsx
/* eslint-disable unicorn/string-content */
import { extname, resolve } from "node:path"
import { existsSync } from "node:fs"
import { format } from "prettier"
import glob from "fast-glob"

export const refresh = 2

const pagesDir = resolve(__dirname, "../src/pages")
const pages = glob
  .sync(["*.page.tsx", "**/*.page.tsx"], { cwd: pagesDir })
  .map((path, i) => ({
    path: path
      .replace(/(^|\/)index\.page\.tsx$/, "")
      .replace(/\.page\.tsx$/, "")
      .replace(/\[\.{3}(.+?)]/g, "*")
      .replace(/\[(.+?)]/g, ":$1")
      .replace(/\.{3}/g, "*"),
    importee: `./pages/${path.slice(0, -extname(path).length)}`,
    identifier: `Page${i + 1}`,
  }))

const has404 = existsSync(resolve(pagesDir, "404.page.tsx"))

const script = /* jsx */ `
  import { lazy } from "react"
  import type { RouteComponentProps } from "wouter"
  import { Route } from "wouter"

  export const data: {
    path: string
    render: () => Promise<{
      default: React.ComponentType<RouteComponentProps<any>>;
    }>
  }[] = [
  ${pages
    .map(
      ({ path, importee }) =>
        `{\npath: "/${path}", \nrender: () => import("${importee}") }`,
    )
    .join(",")},
  ]
  
  const routes = data.map(({ path, render }) => (
    <Route key={path} path={path} component={lazy(render)} />
  ));

  ${
    has404
      ? `routes.push(<Route key="404" component={lazy(() => import("./pages/404.page"))} />);`
      : ""
  }

  export default routes;
`

void format(script, { parser: "babel-ts" }).then(console.log)
