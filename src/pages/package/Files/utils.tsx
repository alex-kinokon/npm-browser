import { resolve } from "node:path"
import JSON5 from "json5"
import { css } from "@emotion/css"
import type { MappedFile } from "./index"

export function setupLinks({
  node,
  file,
  files,
  setPath,
  navigate,
}: {
  node: HTMLDivElement | null
  file: MappedFile
  files: MappedFile[]
  setPath: (path: string) => void
  navigate: (path: string) => void
}) {
  if (!node) return

  for (const el of node.querySelectorAll(".token.string")) {
    const text = el.textContent
    if (!text) continue

    const prev = el.previousElementSibling
    const prevPrev = el.previousElementSibling?.previousElementSibling

    if (isRelativeImport(text)) {
      const path = JSON5.parse(text)
      const resolved = resolveLink(file, path, files)
      if (!resolved) continue
      el.classList.add(link)
      ;(el as HTMLElement).onclick = () => setPath(resolved)
      continue
    }

    if (
      (prev?.classList.contains("keyword") && prev.textContent === "from") ||
      (prev?.classList.contains("punctuation") &&
        prevPrev?.classList.contains("function") &&
        prevPrev.textContent === "require")
    ) {
      const path = JSON5.parse(text)
      const packageNameSegments = path.split("/")
      const packageName =
        packageNameSegments[0][0] === "@"
          ? packageNameSegments.slice(0, 2).join("/")
          : packageNameSegments[0]

      if (builtinModules.has(path) || path[0] === "#") continue
      el.classList.add(link)
      ;(el as HTMLElement).onclick = () => navigate(`/package/${packageName}`)
      continue
    }
  }
}

function isRelativeImport(text: string) {
  return (
    (text[0] === '"' || text[0] === "'") &&
    text[1] === "." &&
    (text[2] === "/" || (text[2] === "." && text[3] === "/")) &&
    text[0] === text.at(-1)
  )
}

const link = css`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
  &::first-letter {
    text-decoration-color: #fff;
  }
`

function resolveLink(source: MappedFile, target: string, files: MappedFile[]) {
  switch (source.contentType.split("/")[1]) {
    case "javascript":
    case "typescript":
      const native = resolve(source.dirname, target)
      const paths = new Set(files.map((file) => file.path))

      for (const candidate of [
        native,
        `${native}.js`,
        `${native}.jsx`,
        `${native}.ts`,
        `${native}.tsx`,
        `${native}/index.js`,
        `${native}/index.jsx`,
        `${native}/index.ts`,
        `${native}/index.tsx`,
      ]) {
        if (paths.has(candidate)) return candidate
      }
  }
}

const builtinModules = new Set([
  "_http_agent",
  "_http_client",
  "_http_common",
  "_http_incoming",
  "_http_outgoing",
  "_http_server",
  "_stream_duplex",
  "_stream_passthrough",
  "_stream_readable",
  "_stream_transform",
  "_stream_wrap",
  "_stream_writable",
  "_tls_common",
  "_tls_wrap",
  "assert",
  "assert/strict",
  "async_hooks",
  "buffer",
  "child_process",
  "cluster",
  "console",
  "constants",
  "crypto",
  "dgram",
  "diagnostics_channel",
  "dns",
  "dns/promises",
  "domain",
  "events",
  "fs",
  "fs/promises",
  "http",
  "http2",
  "https",
  "inspector",
  "inspector/promises",
  "module",
  "net",
  "os",
  "path",
  "path/posix",
  "path/win32",
  "perf_hooks",
  "process",
  "punycode",
  "querystring",
  "readline",
  "readline/promises",
  "repl",
  "stream",
  "stream/consumers",
  "stream/promises",
  "stream/web",
  "string_decoder",
  "sys",
  "timers",
  "timers/promises",
  "tls",
  "trace_events",
  "tty",
  "url",
  "util",
  "util/types",
  "v8",
  "vm",
  "wasi",
  "worker_threads",
  "zlib",
])
