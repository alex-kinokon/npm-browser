import type { RawPackageManifest } from "../types/rawPackageManifest"
import type { RawPackument } from "../types/rawPackument"
import { InvalidPackageVersionError } from "./errors"
import { log } from "./log"

export function extractRawPackageManifest(
  rawPackument: RawPackument,
  version = "latest"
): RawPackageManifest {
  const { name, "dist-tags": distTags, versions } = rawPackument
  const versionNumber = distTags[version] ?? version
  const manifest = versions[versionNumber]
  if (!manifest) {
    log("getPackageManifest: invalid package version: %O", {
      name,
      version,
    })
    throw new InvalidPackageVersionError(`invalid package version: '${name}@${version}'`)
  }

  return manifest
}
