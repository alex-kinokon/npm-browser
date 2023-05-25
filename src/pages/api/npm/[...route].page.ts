import type { PageConfig } from "next"
import type { NextRequest } from "next/server"

export const config: PageConfig = {
  runtime: "edge",
}

export default async function getNPM(req: NextRequest) {
  const url = new URL(req.url)
  const pathname = url.pathname.slice("/api/npm/".length)

  if (!pathname.startsWith("package/") && !/^(@[\w-]+\/)?[\w-]+$/.test(pathname)) {
    return new Response("Invalid route", { status: 400 })
  }

  return fetch(`https://www.npmjs.com/${pathname}${url.search}`, {
    redirect: "follow",
    headers: {
      ...req.headers,
      "x-spiferack": "1",
    },
  })
}
