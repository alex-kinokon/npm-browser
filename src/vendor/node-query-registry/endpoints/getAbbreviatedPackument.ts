import type { DistTags } from "../types/distTags"
import type { RawAbbreviatedPackument } from "../types/rawAbbreviatedPackument"
import { getRawAbbreviatedPackument } from "./getRawAbbreviatedPackument"

/**
 * `getAbbreviatedPackument` returns the abbreviated packument (package document)
 * containing only the metadata necessary to install a package present on the registry.
 *
 * @remarks
 * To get all the metadata (full packument) about a package see {@link getPackument}.
 *
 * @param name - package name
 * @param registry - URL of the registry (default: npm registry)
 * @param mirrors - URLs of the registry mirrors (default: npm registry mirrors)
 * @param cached - accept cached responses (default: `true`)
 *
 * @example
 * Get the abbreviated packument for package `query-registry` from the npm registry:
 *
 * ```typescript
 * import { getAbbreviatedPackument } from 'query-registry';
 *
 * (async () => {
 *     const packument = await getAbbreviatedPackument({ name: 'query-registry' });
 *
 *     // Output: 'query-registry'
 *     console.log(packument.name);
 * })();
 * ```
 *
 * @see {@link AbbreviatedPackument}
 * @see {@link RawAbbreviatedPackument}
 * @see {@link npmRegistry}
 * @see {@link npmRegistryMirrors}
 */
export async function getAbbreviatedPackument({
  name,
  registry,
  mirrors,
  cached,
}: {
  name: string
  registry?: string
  mirrors?: string[]
  cached?: boolean
}): Promise<AbbreviatedPackument> {
  const rawAbbreviatedPackument = await getRawAbbreviatedPackument({
    name,
    registry,
    mirrors,
    cached,
  })
  return normalizeRawAbbreviatedPackument(rawAbbreviatedPackument)
}

function normalizeRawAbbreviatedPackument(
  rawAbbreviatedPackument: RawAbbreviatedPackument
): AbbreviatedPackument {
  const {
    "dist-tags": distTags,
    name: id,
    modified: modifiedAt,
  } = rawAbbreviatedPackument
  return {
    ...rawAbbreviatedPackument,
    id,
    distTags,
    modifiedAt,
  }
}

/**
 * `AbbreviatedPackument` represents a packument (package document)
 * containing only the metadata necessary to install a package.
 *
 * @see {@link RawAbbreviatedPackument}
 */
export interface AbbreviatedPackument extends RawAbbreviatedPackument {
  /** Unique package name (for example, `foo` or `@bar/baz`) */
  readonly id: string

  /**
   * Timestamp of when the package was last modified
   * in ISO 8601 format (for example, `2021-11-23T19:12:24.006Z`);
   * (alias to `modified`)
   */
  readonly modifiedAt: string

  /**
   * Mapping of distribution tags to version numbers
   * (alias to `dist-tags`)
   *
   * @see {@link DistTags}
   */
  readonly distTags: DistTags
}
