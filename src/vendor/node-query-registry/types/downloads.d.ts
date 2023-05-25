/**
 * `RegistryDownloads` lists the number of downloads for the registry
 *  in a given time period.
 *
 * @see {@link https://github.com/npm/registry/blob/master/docs/download-counts.md#point-values}
 */
export interface RegistryDownloads {
  /** Total number of downloads */
  readonly downloads: number

  /** Date of the first day (inclusive) */
  readonly start: string

  /** Date of the last day (inclusive) */
  readonly end: string
}
