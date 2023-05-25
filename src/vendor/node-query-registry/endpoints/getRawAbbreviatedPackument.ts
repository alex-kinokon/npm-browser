import type { RawAbbreviatedPackument } from "../types/rawAbbreviatedPackument"
import { assertValidPackageName } from "../utils/assertValidPackageName"
import { fetchFromRegistry } from "../utils/fetchFromRegistry"

/**
 * `getRawAbbreviatedPackument` returns the abbreviated packument (package document)
 * containing only the metadata necessary to install a package present on the registry.
 *
 * Note: the abbreviated packument is returned as retrieved from the registry.
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
 * import { getRawAbbreviatedPackument } from 'query-registry';
 *
 * (async () => {
 *     const packument = await getRawAbbreviatedPackument({ name: 'query-registry' });
 *
 *     // Output: 'query-registry'
 *     console.log(packument.name);
 * })();
 * ```
 *
 * @see {@link RawAbbreviatedPackument}
 * @see {@link npmRegistry}
 * @see {@link npmRegistryMirrors}
 */
export async function getRawAbbreviatedPackument({
  name,
  registry,
  mirrors,
  cached,
}: {
  name: string
  registry?: string
  mirrors?: string[]
  cached?: boolean
}): Promise<RawAbbreviatedPackument> {
  assertValidPackageName(name)

  return fetchFromRegistry({
    endpoint: `/${name}`,
    headers: {
      Accept: "application/vnd.npm.install-v1+json",
    },
    registry,
    mirrors,
    cached,
  })
}
