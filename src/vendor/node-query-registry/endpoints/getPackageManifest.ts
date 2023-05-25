import type { PackageManifest } from "../types/packageManifest"
import type { RawPackageManifest } from "../types/rawPackageManifest"
import type { RawPackument } from "../types/rawPackument"
import { extractRawPackageManifest } from "../utils/extractPackageManifest"
import {
  normalizeRawLicense,
  normalizeRawRepository,
} from "../utils/normalizeRawRepository"
import { getRawPackageManifest } from "./getRawPackageManifest"
import { getRawPackument } from "./getRawPackument"

/**
 * `getPackageManifest` returns the manifest describing
 * a specific version of a package.
 *
 * @param name - package name
 * @param version - package version (default: `latest`)
 * @param registry - URL of the registry (default: npm registry)
 * @param mirrors - URLs of the registry mirrors (default: npm registry mirrors)
 * @param cached - accept cached responses (default: `true`)
 *
 * @example
 * Get the latest manifest for package `query-registry` from the npm registry:
 *
 * ```typescript
 * import { getPackageManifest } from 'query-registry';
 *
 * (async () => {
 *     const manifest = await getPackageManifest({ name: 'query-registry' });
 *
 *     // Output: 'query-registry'
 *     console.log(manifest.name);
 * })();
 * ```
 *
 * @example
 * Get the manifest for package `query-registry@1.0.0` from the npm registry:
 *
 * ```typescript
 * import { getPackageManifest } from 'query-registry';
 *
 * (async () => {
 *     const manifest = await getPackageManifest({ name: 'query-registry', version: '1.0.0' });
 *
 *     // Output: 'query-registry'
 *     console.log(manifest.name);
 *
 *     // Output: '1.0.0'
 *     console.log(manifest.version);
 * })();
 * ```
 *
 * @see {@link PackageManifest}
 * @see {@link RawPackageManifest}
 * @see {@link npmRegistry}
 * @see {@link npmRegistryMirrors}
 */
export async function getPackageManifest({
  name,
  version,
  registry,
  mirrors,
  cached,
}: {
  name: string
  version?: string
  registry?: string
  mirrors?: string[]
  cached?: boolean
}): Promise<PackageManifest> {
  const rawPackument = await getRawPackument({
    name,
    registry,
    mirrors,
    cached,
  })

  const rawPackageManifest = extractRawPackageManifest(rawPackument, version)

  const packageManifest = await normalizeRawPackageManifest({
    rawPackageManifest,
    rawPackument,
    registry,
    mirrors,
    cached,
  })

  return packageManifest
}

async function normalizeRawPackageManifest({
  rawPackageManifest,
  rawPackument,
  registry,
  mirrors,
  cached,
}: {
  rawPackageManifest: RawPackageManifest
  rawPackument: RawPackument
  registry?: string
  mirrors?: string[]
  cached?: boolean
}): Promise<PackageManifest> {
  const {
    _id: id,
    name,
    version,
    license: rawLicense,
    repository: rawRepository,
    _npmUser: publisher,
  } = rawPackageManifest

  const createdAt = rawPackument.time[version]!
  const license = normalizeRawLicense(rawLicense)
  const gitRepository = normalizeRawRepository(rawRepository)
  const definitelyTypedName = await getDefinitelyTypedName({
    rawPackageManifest,
    registry,
    mirrors,
    cached,
  })
  const untypedName = getUntypedName({ name })

  return {
    ...rawPackageManifest,
    id,
    createdAt,
    publisher,
    license,
    gitRepository,
    definitelyTypedName,
    untypedName,
  }
}

/**
 * `getUntypedName` returns the name of the normal package
 * corresponding to a DefinitelyTyped package.
 */
export function getUntypedName({ name }: { name: string }): string | undefined {
  if (!name.startsWith("@types/")) {
    return undefined
  }

  // ['foo', undefined] or ['@bar', 'baz']
  const [scopeOrName, scopedName] = name.replace("@types/", "").split("__")

  return scopedName ? `@${scopeOrName}/${scopedName}` : scopeOrName
}

async function getDefinitelyTypedName({
  rawPackageManifest,
  registry,
  mirrors,
  cached,
}: {
  rawPackageManifest: RawPackageManifest
  registry?: string
  mirrors?: string[]
  cached?: boolean
}): Promise<string | undefined> {
  const { name, types, typings } = rawPackageManifest
  const definitelyTypedName = toDefinitelyTypedName(name)
  const alreadyTyped = name === definitelyTypedName || !!types || !!typings
  if (alreadyTyped) {
    return undefined
  }

  let ok = false
  try {
    const { deprecated } = await getRawPackageManifest({
      name: definitelyTypedName,
      registry,
      mirrors,
      cached,
    })
    ok = deprecated === undefined
  } catch {}
  return ok ? definitelyTypedName : undefined
}

/**
 * `toDefinitelyTypedName` returns the name of the corresponding
 * DefinitelyTyped package (for example,
 * `foo` => `@types/foo`,
 * `@bar/baz` => `@types/bar__baz`).
 */
function toDefinitelyTypedName(name: string): string {
  return name.startsWith("@types/")
    ? name
    : `@types/${name.replace("@", "").replace("/", "__")}`
}
