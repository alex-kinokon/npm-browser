import type { PageConfig } from "next"
import type { NextRequest } from "next/server"

export const config: PageConfig = {
  runtime: "edge",
}

export default async function getNPMRoot(req: NextRequest) {
  const url = new URL(req.url)

  return fetch(`https://www.npmjs.com/${url.search}`, {
    redirect: "follow",
    headers: { ...req.headers, "x-spiferack": "1" },
  })
}
