// MIT License.
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import type { FastifyInstance, FastifyPluginCallback } from "fastify"
import fp from "fastify-plugin"
import middie from "@fastify/middie"
import type { UserConfig, UserConfigExport } from "vite"
import { createServer } from "vite"

interface FastifyViteConfig {
  root: string
  getConfig: () => Promise<UserConfigExport | { default: UserConfigExport }>
}

function getDefault<T extends object>(value: { default: T } | T) {
  return "default" in value ? value.default : value
}

async function resolveViteConfig(options: FastifyViteConfig) {
  const userConfig = getDefault<UserConfigExport>(await options.getConfig())

  if (typeof userConfig === "function") {
    return await userConfig({
      command: "serve",
      mode: process.env.NODE_ENV!,
    })
  }

  return userConfig as UserConfig
}

class FastifyVite {
  #scope: FastifyInstance
  #options: FastifyViteConfig

  constructor(scope: FastifyInstance, options: FastifyViteConfig) {
    this.#scope = scope
    this.#options = options
  }

  async ready() {
    const scope = this.#scope
    const config = await resolveViteConfig(this.#options)

    await scope.register(middie)
    const indexHtmlPath = join(this.#options.root!, "index.html")
    const devServer = await createServer({
      configFile: false,
      ...config,
      server: {
        middlewareMode: true,
        ...config.server,
      },
      appType: "custom",
    })
    scope.use(devServer.middlewares)
    scope.decorateReply("html", null)
    scope.addHook("onRequest", async (req, reply) => {
      reply.html = async function () {
        const indexHtml = await readFile(indexHtmlPath, "utf8")
        const source = await devServer.transformIndexHtml(req.url, indexHtml)
        this.type("text/html").send(source)
      }
    })
  }
}

declare module "fastify" {
  interface FastifyInstance {
    vite: FastifyVite
  }
  interface FastifyReply {
    html(this: FastifyReply): void
  }
}

export default fp(
  ((scope, options, done) => {
    scope.decorate("vite", new FastifyVite(scope, options))
    done()
  }) as FastifyPluginCallback<FastifyViteConfig>,
  { name: "@fastify/vite" }
)
