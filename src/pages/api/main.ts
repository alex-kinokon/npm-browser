import { resolve } from "node:path"
import { promises as fs } from "node:fs"
import createFastify from "fastify"
import fastifyStatic from "@fastify/static"
import fastifyHelmet from "@fastify/helmet"
import fastifyMultipart from "@fastify/multipart"
import fastifyRateLimit from "@fastify/rate-limit"
import formDataPlugin from "@fastify/formbody"
import { bindRoutes } from "./routes.generated"

const port = parseInt(process.env.PORT || "3000")

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
  await app.register(fastifyMultipart)
  await app.register(formDataPlugin)
  await bindRoutes(app)

  await app.register(fastifyRateLimit, {
    max: 100,
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
    app.setNotFoundHandler((_req, reply) => {
      reply.type("text/html").send(html)
    })
  }

  await app.listen({ port })

  if (process.env.NODE_ENV === "production") {
    console.log(`Server listening on port ${port}`)
  }
}
