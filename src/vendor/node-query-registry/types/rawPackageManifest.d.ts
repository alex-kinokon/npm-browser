import type { PackageJson } from "./package-json"
import type { Person } from "./person"

/**
 * `RawPackageManifest` represents the manifest, as returned by the registry,
 * describing a specific version of a package.
 *
 * @remarks
 * For some packages, especially legacy ones,
 * the properties may be mistyped due to incorrect data present on the registry.
 *
 * @see {@link https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md#getpackageversion}
 * @see {@link https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md#abbreviated-version-object}
 * @see {@link https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md#full-metadata-format}
 * @see {@link https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md#version}
 * @see {@link PackageJson}
 */
export interface RawPackageManifest extends PackageJson {
  /** Package version ID (for example, `foo@1.0.0` or `@bar/baz@1.0.0`) */
  readonly _id: string

  /** Package name */
  readonly name: string

  /** Package version number */
  readonly version: string

  /**
   * Distribution data from the registry
   *
   * @see {@link DistInfo}
   */
  readonly dist: DistInfo

  /** Commit hash corresponding to the published version */
  readonly gitHead?: string

  /**
   * User who published this package version
   *
   * @see {@link Person}
   */
  readonly _npmUser: Person

  /** Node version used when publishing */
  readonly _nodeVersion?: string

  /** npm version used when publishing */
  readonly _npmVersion?: string

  /**
   * Internal npm data
   *
   * @see {@link NpmOperationalInternal}
   */
  readonly _npmOperationalInternal?: NpmOperationalInternal

  /** True if the package has a shrinkwrap file */
  readonly _hasShrinkwrap?: boolean
}

/**
 * `DistInfo` contains data describing the distributed package.
 *
 * @see {@link https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md#dist}
 */
export interface DistInfo {
  /** Tarball URL */
  readonly tarball: string

  /** SHA1 sum of the tarball */
  readonly shasum: string

  /** Usually, SHA512 sum of the tarball preceded by `sha512-` */
  readonly integrity?: string

  /** Number of files in the tarball */
  readonly fileCount?: number

  /** Total size in bytes of the unpacked files in the tarball */
  readonly unpackedSize?: number

  /** npm PGP signature */
  readonly "npm-signature"?: string
}

export interface NpmOperationalInternal {
  readonly host: string
  readonly tmp: string
}
