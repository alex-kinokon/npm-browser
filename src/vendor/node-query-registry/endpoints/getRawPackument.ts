import type { RawPackument } from "../types/rawPackument"
import { assertValidPackageName } from "../utils/assertValidPackageName"
import { fetchFromRegistry } from "../utils/fetchFromRegistry"

/**
 * `getRawPackument` returns the packument (package document) containing
 * all the metadata about a package present on the registry.
 *
 * Note: the packument is returned as retrieved from the registry.
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
 * import { getRawPackument } from 'query-registry';
 *
 * const packument = await getRawPackument({ name: 'query-registry' });
 *
 * // Output: 'query-registry'
 * console.log(packument.name);
 * ```
 */
export async function getRawPackument({
  name,
  registry,
  mirrors,
  cached,
}: {
  name: string
  registry?: string
  mirrors?: string[]
  cached?: boolean
}): Promise<RawPackument> {
  assertValidPackageName(name)

  return fetchFromRegistry({ endpoint: `/${name}`, registry, mirrors, cached })
}
