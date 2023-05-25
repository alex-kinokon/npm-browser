import type { DistTags } from "../types/distTags"
import type { GitRepository } from "../types/gitRepository"
import type { RawPackument } from "../types/rawPackument"
import {
  normalizeRawLicense,
  normalizeRawRepository,
} from "../utils/normalizeRawRepository"
import { getRawPackument } from "./getRawPackument"

/**
 * `getPackument` returns the packument (package document) containing
 * all the metadata about a package present on the registry.
 *
 * @param name - package name
 * @param registry - URL of the registry (default: npm registry)
 * @param mirrors - URLs of the registry mirrors (default: npm registry mirrors)
 * @param cached - accept cached responses (default: `true`)
 *
 * @example
 * Get the packument for package `query-registry` from the npm registry:
 *
 * ```typescript
 * import { getPackument } from 'query-registry';
 *
 * const packument = await getPackument({ name: 'query-registry' });
 *
 * // Output: 'query-registry'
 * console.log(packument.name);
 * ```
 *
 * @see {@link Packument}
 * @see {@link RawPackument}
 * @see {@link npmRegistry}
 * @see {@link npmRegistryMirrors}
 */
export async function getPackument({
  name,
  registry,
  mirrors,
  cached,
}: {
  name: string
  registry?: string
  mirrors?: string[]
  cached?: boolean
}): Promise<Packument> {
  const rawPackument = await getRawPackument({
    name,
    registry,
    mirrors,
    cached,
  })
  return normalizeRawPackument(rawPackument)
}

function normalizeRawPackument(rawPackument: RawPackument): Packument {
  const {
    _id: id,
    "dist-tags": distTags,
    time,
    license: rawLicense,
    repository: rawRepository,
  } = rawPackument
  const license = normalizeRawLicense(rawLicense)
  const gitRepository = normalizeRawRepository(rawRepository)
  const versionsToTimestamps = Object.fromEntries(
    Object.entries(time).filter(([key]) => !["created", "modified"].includes(key))
  )

  return {
    ...rawPackument,
    id,
    distTags,
    versionsToTimestamps,
    license,
    gitRepository,
  }
}

/**
 * `Packument` represents a packument (package document)
 * containing all the data about a package.
 *
 * @remarks
 * For some packages, especially legacy ones,
 * the properties may be mistyped due to incorrect data present on the registry.
 *
 * @see {@link RawPackument}
 */
export interface Packument extends RawPackument {
  /**
   * Unique package name (for example, `foo` or `@bar/baz`;
   * alias to `_id`)
   */
  readonly id: string

  /**
   * Mapping of distribution tags to version numbers
   * (alias to `dist-tags`)
   *
   * @see {@link DistTags}
   */
  readonly distTags: DistTags

  /**
   * Mapping of version numbers to publishing timestamps
   * without the `created` or `modified` properties
   * present in the `time` property
   *
   * @see {@link VersionsToTimestamps}
   */
  readonly versionsToTimestamps: Record<string, string>

  /** Normalized license */
  readonly license?: string

  /** Normalized git repository */
  readonly gitRepository?: GitRepository
}
