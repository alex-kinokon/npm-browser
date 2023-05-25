import { npmRegistry, npmRegistryMirrors } from "../data/registries"
import type { FetchError } from "./errors"
import { fetch } from "./fetch"
import { log } from "./log"

export async function fetchFromRegistry<T>({
  endpoint,
  headers,
  query,
  registry = npmRegistry,
  mirrors = npmRegistryMirrors,
  cached,
}: {
  endpoint: string
  headers?: Record<string, string>
  query?: string
  registry?: string
  mirrors?: string[]
  cached?: boolean
}): Promise<T> {
  if (endpoint[0] === "/") {
    endpoint = endpoint.slice(1)
  }
  const urls = [registry, ...mirrors].map(
    base => `${base}/${endpoint}${query ? `?${query}` : ""}`
  )

  let lastError: FetchError | undefined
  for (const url of urls) {
    try {
      const json = await fetch({ url, headers, cached })
      return json as T
    } catch (err) {
      // Keep last fetch error
      lastError = err as any
    }
  }

  log("fetchFromRegistry: cannot retrieve data from registry or mirrors: %O", {
    endpoint,
    headers,
    query,
    registry,
    mirrors,
    lastError,
  })
  throw lastError
}
