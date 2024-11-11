#!/usr/bin/env tsx
import fs from "node:fs";
import assert from "node:assert";
import { resolve } from "node:path";

import { buildSync } from "esbuild";
import { ContextualKeyword, TokenType } from "../src/vendor/sucrase";
import * as babel from "@babel/core";

const sucrase = resolve(__dirname, "../src/vendor/sucrase.js");
buildSync({
  stdin: {
    contents: /* js */ `
      export { parse } from "../../sucrase/src/parser";
    `,
    resolveDir: resolve(__dirname, "../src/vendor"),
  },
  outfile: sucrase,
  bundle: true,
  format: "esm",
  minify: true,
  packages: "external",
  platform: "node",
  target: "esnext",
});
const res = babel.transformFileSync(sucrase, {
  minified: true,
  plugins: ["@babel/plugin-transform-block-scoping"],
});
assert(res?.code != null);
fs.writeFileSync(
  sucrase,
  "/* eslint-disable */" +
    res.code +
    ";export const TokenType = " +
    JSON.stringify(TokenType) +
    ";export const ContextualKeyword = " +
    // @ts-expect-error esbuild ignores const of enum
    JSON.stringify(ContextualKeyword) +
    ";",
);

const lite = resolve(__dirname, "../src/lite.ts");
const src = fs
  .readFileSync(lite, "utf8")
  .replace(/\btt\.(\w+)\b/g, (_, name) => TokenType[name])
  .replace(
    /\bContextualKeyword\.(\w+)\b/g,
    // @ts-expect-error const enum
    (_, name: ContextualKeyword) => ContextualKeyword[name],
  );

buildSync({
  stdin: {
    contents: src,
    resolveDir: resolve(__dirname, "../src"),
    loader: "ts",
  },
  outfile: "../../../pages/package/Files/getImports.js",
  bundle: true,
  format: "esm",
  packages: "external",
  platform: "node",
  target: "esnext",
  minify: true,
});
