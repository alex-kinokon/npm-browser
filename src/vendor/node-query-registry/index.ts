/**
 * This package exports several functions to query
 * the {@link https://www.npmjs.com | npm registry}
 * (or one of its mirrors) through one of its
 * {@link https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md | endpoints}.
 *
 * @example
 * Get the metadata for the npm registry:
 *
 * ```typescript
 * import { getRegistryMetadata } from 'query-registry';
 *
 * (async () => {
 *     const metadata = await getRegistryMetadata();
 *
 *     // Output: 'registry'
 *     console.log(metadata.db_name);
 * })();
 * ```
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
 * Get the abbreviated packument for package `query-registry` from the npm registry:
 *
 * ```typescript
 * import { getAbbreviatedPackument } from 'query-registry';
 *
 * (async () => {
 *     const packument = await getAbbreviatedPackument({ name: 'query-registry' });
 *
 *     // Output: 'query-registry'
 *     console.log(manifest.name);
 * })();
 * ```
 *
 * @example
 * Get the weekly downloads for package `query-registry` from the npm registry:
 *
 * ```typescript
 * import { getPackageDownloads } from 'query-registry';
 *
 * (async () => {
 *     const downloads = await getPackageDownloads({ name: 'query-registry' });
 *
 *     // Output: 'query-registry'
 *     console.log(downloads.package);
 *
 *     // Output: 'number'
 *     console.log(typeof downloads.downloads);
 * })();
 * ```
 *
 * @example
 * Get the search results for text query `query-registry` from the npm registry:
 *
 * ```typescript
 * import { searchPackages } from 'query-registry';
 *
 * (async () => {
 *     const results = await searchPackages({ query: { text: 'query-registry' } });
 *
 *     // Output: 'query-registry'
 *     console.log(results.objects[0].package.name);
 * })();
 * ```
 *
 * @example
 * Enable {@link https://www.npmjs.com/package/debug | debug messages}
 * by setting the `DEBUG` environment variable to `query-registry`
 * (available only in non production environments):
 *
 * ```bash
 * $ DEBUG="query-registry"
 * ```
 *
 * @packageDocumentation
 */

export * from "./data/registries"
export * from "./endpoints/getAbbreviatedPackument"
export * from "./endpoints/getDailyPackageDownloads"
export * from "./endpoints/getDailyRegistryDownloads"
export * from "./endpoints/getPackageDownloads"
export * from "./endpoints/getPackageManifest"
export * from "./endpoints/getPackument"
export * from "./endpoints/getRawAbbreviatedPackument"
export * from "./endpoints/getRawPackageManifest"
export * from "./endpoints/getRawPackument"
export * from "./endpoints/getRegistryDownloads"
export * from "./endpoints/getRegistryMetadata"
export * from "./endpoints/searchPackages"
export type * from "./types/distTags"
export type * from "./types/downloadPeriod"
export type * from "./types/downloads"
export type * from "./types/gitRepository"
export type * from "./types/package-json"
export type * from "./types/packageManifest"
export type * from "./types/person"
export type * from "./types/rawAbbreviatedPackument"
export type * from "./types/rawPackageManifest"
export type * from "./types/rawPackument"
export type * from "./types/repository"
export * from "./utils/errors"
