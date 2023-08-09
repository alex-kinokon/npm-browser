import type { FastifyReply, FastifyRequest } from "fastify"

export async function proxy(url: string, req: FastifyRequest, reply: FastifyReply) {
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
