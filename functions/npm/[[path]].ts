export const onRequest: PagesFunction = async (context) => {
  const { request, params } = context
  const path = params.path as string[]
  const pathname = path.join("/")

  // Validate the route
  if (
    path[0] !== "package" &&
    !/^(@[\w-]+\/)?[\w-]+$/.test(pathname) &&
    !path[0].startsWith("~")
  ) {
    return new Response("Invalid route", { status: 400 })
  }

  // Proxy the request to npm
  const proxyUrl = `https://www.npmjs.com/${pathname}`
  const proxyRequest = new Request(proxyUrl, {
    method: request.method,
    headers: {
      accept: "application/json",
      "user-agent": request.headers.get("user-agent") || "",
      "x-spiferack": "1",
    },
    redirect: "follow",
    body: request.body!,
  })

  const proxyResponse = await fetch(proxyRequest)

  // Check response status and process the response
  if (!proxyResponse.ok) {
    return new Response(await proxyResponse.text(), {
      status: proxyResponse.status,
    })
  }

  const contentType =
    proxyResponse.headers.get("content-type") ?? "application/octet-stream"
  if (contentType.includes("application/json")) {
    const data: Record<string, any> = await proxyResponse.json()

    // Remove unwanted fields
    delete data.csrftoken
    delete data.npmExpansions

    return new Response(JSON.stringify(data), {
      status: proxyResponse.status,
      headers: {
        "content-type": contentType,
      },
    })
  } else {
    return new Response(await proxyResponse.text(), {
      status: proxyResponse.status,
      headers: {
        "content-type": contentType,
      },
    })
  }
}
