import { resolve } from "node:path"
import { promises as fs } from "node:fs"
import createFastify, { type FastifyReply, type FastifyRequest } from "fastify"
import fastifyStatic from "@fastify/static"
import fastifyHelmet from "@fastify/helmet"
import fastifyRateLimit from "@fastify/rate-limit"

const port = parseInt(process.env.PORT || "3008")

export async function main() {
  const app = createFastify({
    logger: {
      level: process.env.NODE_ENV === "production" ? "info" : "error",
    },
  })

  await app.register(fastifyHelmet, {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })

  app.all("/api/npm/*", async (req, reply) => {
    const pathname = req.url.slice("/api/npm/".length)

    if (!pathname.startsWith("package/") && !/^(@[\w-]+\/)?[\w-]+$/.test(pathname)) {
      return reply.code(400).send("Invalid route")
    }

    return proxy(`https://www.npmjs.com/${pathname}`, req, reply)
  })

  await app.register(fastifyRateLimit, {
    max: 70,
    timeWindow: "1 minute",
  })

  if (process.env.NODE_ENV === "development") {
    const fastifyVite = await import("~/vendor/fastify-vite")
    await app.register(fastifyVite.default, {
      root: ".",
      getConfig: () => import("../../../vite.config"),
    })

    app.get("/*", (_req, reply) => {
      reply.html()
    })

    await app.vite.ready()
  } else {
    const root = process.env.ASSETS_DIR || resolve(__dirname, "..")
    const html = await fs.readFile(resolve(root, "index.html"))

    await app.register(fastifyStatic, {
      root: resolve(root, "assets"),
      prefix: "/assets",
      wildcard: false,
    })
    app.setNotFoundHandler(async (_req, reply) => {
      await reply.type("text/html").send(html)
    })
  }

  await app.listen({ port })

  console.log(`Server listening on port ${port}`)
}

async function proxy(url: string, req: FastifyRequest, reply: FastifyReply) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      accept: "application/json",
      "user-agent": req.headers["user-agent"]!,
      "x-spiferack": "1",
    },
  })

  if (!res.ok) {
    return reply.code(res.status).send(await res.text())
  }

  const contentType = res.headers.get("content-type") ?? "application/octet-stream"
  if (contentType?.includes("application/json")) {
    const data = await res.json()
    delete data.csrftoken
    delete data.npmExpansions
    return reply.code(res.status).type(contentType).send(data)
  } else {
    return reply
      .code(res.status)
      .type(contentType)
      .send(await res.text())
  }
}
