/// <reference types="bun-types" />

const { port } = Bun.serve({
  port: parseInt(process.env.PORT || "3000"),
  async fetch(req) {
    const { pathname } = new URL(req.url)
    const real = pathname.slice("/api/npm/".length)

    if (!real.startsWith("package/") && !/^(@[\w-]+\/)?[\w-]+$/.test(pathname)) {
      return new Response("Invalid route", { status: 400 })
    }

    const res = await fetch(`https://www.npmjs.com/${pathname}`, {
      redirect: "follow",
      headers: {
        accept: "application/json",
        "user-agent": req.headers.get("user-agent") || "",
        "x-spiferack": "1",
      },
    })

    if (!res.ok) {
      return res
    }

    const contentType = res.headers.get("content-type") || "application/octet-stream"

    if (contentType.includes("application/json")) {
      const data = await res.json()
      delete data.csrftoken
      delete data.npmExpansions
      return new Response(JSON.stringify(data), res)
    } else {
      return res
    }
  },
})

console.log(`Listening on http://localhost:${port}`)
