import type { RouteHandler } from "fastify"
import { proxy } from "../proxy"

const getNPM: RouteHandler = async (req, reply) => {
  const pathname = req.url.slice("/api/npm/".length)

  if (!pathname.startsWith("package/") && !/^(@[\w-]+\/)?[\w-]+$/.test(pathname)) {
    return reply.code(400).send("Invalid route")
  }

  return proxy(`https://www.npmjs.com/${pathname}`, req, reply)
}

export default getNPM
