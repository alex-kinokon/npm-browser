import type { PageConfig } from "next"
import type { NextRequest } from "next/server"

export const config: PageConfig = {
  runtime: "edge",
}

export default async function getRegistry(req: NextRequest) {
  const url = new URL(req.url)

  return fetch(`https://registry.npmjs.org/${url.search}`, {
    redirect: "follow",
    headers: { ...req.headers, "x-spiferack": "1" },
  })
}
