import type { PageConfig } from "next"
import type { NextRequest } from "next/server"

export const config: PageConfig = {
  runtime: "edge",
}

export default async function getRegistry(req: NextRequest) {
  const url = new URL(req.url)
  const pathname = url.pathname.slice("/api/registry/".length)
  return fetch(`https://registry.npmjs.org/${pathname}${url.search}`, {
    redirect: "follow",
    headers: {
      ...req.headers,
      "x-spiferack": "1",
    },
  })
}
