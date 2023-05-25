import type { DownloadPeriod } from "../types/downloadPeriod"
import type { RegistryDownloads } from "../types/downloads"
import { assertValidPackageName } from "../utils/assertValidPackageName"
import { fetchDownloadsFromRegistry } from "../utils/fetchDownloadsFromRegistry"
import { normalizeRawDownloadPeriod } from "../utils/normalizeDownloadPeriod"

/**
 * `getPackageDownloads` returns the number of downloads for a package
 * in a given time period.
 *
 * @param name - package name
 * @param period - time period in which downloads happened (default: `last-week`)
 * @param registryDownloadsAPI - URL of the registry's downloads API (default: npm registry)
 * @param cached - accept cached responses (default: `true`)
 *
 * @example
 * Get the weekly downloads for package `query-registry` from the npm registry:
 *
 * ```typescript
 * import { getPackageDownloads } from "query-registry";
 *
 * const downloads = await getPackageDownloads({ name: "query-registry" });
 * console.log(downloads.package); // "query-registry"
 * console.log(typeof downloads.downloads); // "number"
 * ```
 *
 * @example
 * Get the monthly downloads for package `query-registry` from the npm registry:
 *
 * ```typescript
 * import { getPackageDownloads } from "query-registry";
 *
 * const downloads = await getPackageDownloads({ name: "query-registry", period: "last-month" });
 * console.log(downloads.package); // "query-registry"
 * console.log(typeof downloads.downloads); // "number"
 * ```
 *
 * @see {@link PackageDownloads}
 * @see {@link DownloadPeriod}
 * @see {@link npmRegistryDownloadsAPI}
 * @see {@link https://github.com/npm/registry/blob/master/docs/download-counts.md#point-values}
 */
export async function getPackageDownloads({
  name,
  period: rawDownloadPeriod,
  registryDownloadsAPI,
  cached,
}: {
  name: string
  period?: DownloadPeriod
  registryDownloadsAPI?: string
  cached?: boolean
}): Promise<PackageDownloads> {
  assertValidPackageName(name)

  const period = normalizeRawDownloadPeriod(rawDownloadPeriod)

  return fetchDownloadsFromRegistry({
    endpoint: `/downloads/point/${period}/${name}`,
    registryDownloadsAPI,
    cached,
  })
}

/**
 * `PackageDownloads` lists the number of downloads for a package
 * in a given time period.
 *
 * @see {@link RegistryDownloads}
 * @see {@link https://github.com/npm/registry/blob/master/docs/download-counts.md#point-values}
 */
export interface PackageDownloads extends RegistryDownloads {
  /** Package name */
  readonly package: string
}
