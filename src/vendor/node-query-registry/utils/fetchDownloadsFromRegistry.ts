import { npmRegistryDownloadsAPI } from "../data/registries"
import { fetchFromRegistry } from "./fetchFromRegistry"

export async function fetchDownloadsFromRegistry<T>({
  endpoint,
  registryDownloadsAPI = npmRegistryDownloadsAPI,
  cached,
}: {
  endpoint: string
  registryDownloadsAPI?: string
  cached?: boolean
}): Promise<T> {
  return fetchFromRegistry({
    endpoint,
    registry: registryDownloadsAPI,
    mirrors: [],
    cached,
  })
}
