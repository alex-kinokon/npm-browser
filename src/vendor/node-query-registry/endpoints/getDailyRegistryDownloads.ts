import type { DownloadPeriod } from "../types/downloadPeriod"
import { fetchDownloadsFromRegistry } from "../utils/fetchDownloadsFromRegistry"
import { normalizeRawDownloadPeriod } from "../utils/normalizeDownloadPeriod"

/**
 * `getDailyRegistryDownloads` returns the number of downloads for all registry packages
 * for each day in a given time period.
 *
 * @param period - time period in which downloads happened (default: `last-week`)
 * @param registryDownloadsAPI - URL of the registry's downloads API (default: npm registry)
 * @param cached - accept cached responses (default: `true`)
 *
 * @example
 * Get the day by day weekly downloads for the npm registry:
 *
 * ```typescript
 * import { getDailyRegistryDownloads } from 'query-registry';
 *
 * (async () => {
 *     const downloads = await getDailyRegistryDownloads();
 *
 *     // Output: 'number'
 *     console.log(typeof downloads.downloads[0].downloads);
 * })();
 * ```
 *
 * @example
 * Get the day by day monthly downloads for the npm registry:
 *
 * ```typescript
 * import { getDailyRegistryDownloads } from 'query-registry';
 *
 * (async () => {
 *     const downloads = await getDailyRegistryDownloads({ period: 'last-month' });
 *
 *     // Output: 'number'
 *     console.log(typeof downloads.downloads[0].downloads);
 * })();
 * ```
 *
 * @see {@link DailyRegistryDownloads}
 * @see {@link DownloadPeriod}
 * @see {@link npmRegistryDownloadsAPI}
 * @see {@link https://github.com/npm/registry/blob/master/docs/download-counts.md#ranges}
 */
export async function getDailyRegistryDownloads({
  period: rawDownloadPeriod,
  registryDownloadsAPI,
  cached,
}: {
  period?: DownloadPeriod
  registryDownloadsAPI?: string
  cached?: boolean
} = {}): Promise<DailyRegistryDownloads> {
  const period = normalizeRawDownloadPeriod(rawDownloadPeriod)
  const endpoint = `/downloads/range/${period}`
  return fetchDownloadsFromRegistry({
    endpoint,
    registryDownloadsAPI,
    cached,
  })
}

/**
 * `DailyRegistryDownloads` lists the number of downloads for the registry
 * for each day in a given time period.
 *
 * @see {@link DownloadsPerDay}
 * @see {@link https://github.com/npm/registry/blob/master/docs/download-counts.md#ranges}
 */
export interface DailyRegistryDownloads {
  /** Download counts per day */
  readonly downloads: DownloadsPerDay[]

  /** Date of the first day (inclusive) */
  readonly start: string

  /** Date of the last day (inclusive) */
  readonly end: string
}

/**
 * `DownloadsPerDay` lists the number of downloads in a given day.
 */
export interface DownloadsPerDay {
  /** Total number of downloads in the day */
  readonly downloads: number

  /** Day date */
  readonly day: string
}
