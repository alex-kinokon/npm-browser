import type { FastifyReply, FastifyRequest } from "fastify"

export async function proxy(url: string, req: FastifyRequest, reply: FastifyReply) {
  const json = await fetch(url, {
    redirect: "follow",
    headers: {
      accept: "application/json",
      "user-agent": req.headers["user-agent"]!,
      "x-spiferack": "1",
    },
  })

  if (!json.ok) {
    return reply.code(json.status).send(await json.text())
  }

  const data = await json.json()
  delete data.csrftoken
  delete data.npmExpansions
  return reply.code(200).type("application/json").send(data)
}
