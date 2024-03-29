import { lru } from "tiny-lru"
import { FetchError } from "./errors"
import { log } from "./log"

const maxItems = 250
const fiveMinutesTTL = 5 * 60 * 1000
const cache = lru(maxItems, fiveMinutesTTL)

export async function fetch({
  url,
  headers,
  cached = true,
}: {
  url: string
  headers?: Record<string, string>
  cached?: boolean
}): Promise<any> {
  const cacheKey = `headers=${JSON.stringify(headers)};url=${url}`
  const cachedJSON = cache.get(cacheKey)
  if (cached && cachedJSON) {
    log("fetch: returning cached response: %O", {
      cacheKey,
      url,
      cachedJSON,
    })
    return cachedJSON
  }
  let response: Response

  try {
    response = await globalThis.fetch(url, { headers })
    if (!response.ok) {
      log("fetch: request failed: %O", {
        url,
        headers,
        status: response.status,
        statusText: response.statusText,
        response,
      })
      throw new FetchError(url, response)
    }
  } catch (e) {
    log("fetch: request failed: %O", {
      url,
      headers,
      e,
    })
    throw new FetchError(url, e)
  }

  const json = await response.json()
  if (cached) {
    cache.set(cacheKey, json)
  }

  log("fetch: returning fresh response: %O", { url, json })
  return json
}
