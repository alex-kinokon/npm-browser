#!/usr/bin/env tsx
import fs from "fs"
import { resolve } from "path"
// import { dependencies } from "../package.json"

const vendorDir = resolve(__dirname, "../src/vendor")

const packages = ([] as string[])
  .concat([
    "@blueprintjs/core",
    "@blueprintjs/icons",
    "@emotion/css",
    "@emotion/react",
    "@emotion/styled",
    "@react-hookz/web",
    "@tanstack/react-query",
    "@uiw/react-markdown-preview",
    "json5",
    "normalize.css",
    "react-dom",
    "@aet/icons",
    "react-paginate",
    "react",
    "wouter",
  ])
  .sort()
  .map(name => ({
    name,
    dir: resolve(__dirname, "../node_modules", name),
  }))
  .concat(
    fs
      .readdirSync(vendorDir)
      .filter(name => !/\.\w+$/.test(name))
      .map(name => ({
        name,
        dir: resolve(vendorDir, name),
      }))
  )

const licenses = Object.fromEntries(
  packages.map(({ name, dir }) => {
    const files = fs
      .readdirSync(dir)
      .filter(name => name.toLowerCase().includes("license"))

    if (files.length) {
      const text = fs.readFileSync(resolve(dir, files[0]), "utf8")
      return [name, text]
    }

    const pkg = require(resolve(dir, "package.json"))
    if (pkg.license) {
      return [name, pkg.license + ". Copyright (c) " + pkg.author || ""]
    }

    return [name, null]
  })
)

const licenseDir = resolve(__dirname, "../licenses")
fs.readdirSync(licenseDir).forEach(name => {
  const content = fs.readFileSync(resolve(licenseDir, name), "utf8")
  licenses[name.replace(/\.\w+$/, "")] = content
})

fs.writeFileSync(
  resolve(__dirname, "../src/licenses.generated.json"),
  JSON.stringify(licenses, null, 2)
)
