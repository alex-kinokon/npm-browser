import type { Person } from "../types/person"
import { fetchFromRegistry } from "../utils/fetchFromRegistry"

/**
 * `searchPackages` returns the packages corresponding to a given query.
 *
 * @param query - one or more search criteria
 * @param registry - URL of the registry (default: npm registry)
 * @param mirrors - URLs of the registry mirrors (default: npm registry mirrors)
 * @param cached - accept cached responses (default: `true`)
 *
 * @example
 * Get the search results for text query `query-registry` from the npm registry:
 *
 * ```typescript
 * import { searchPackages } from 'query-registry';
 *
 * const results = await searchPackages({ query: { text: 'query-registry' } });
 *
 * // Output: 'query-registry'
 * console.log(results.objects[0].package.name);
 * ```
 *
 * @see {@link SearchResults}
 * @see {@link SearchCriteria}
 * @see {@link npmRegistry}
 * @see {@link npmRegistryMirrors}
 */
export async function searchPackages({
  query: rawSearchCriteria,
  registry,
  mirrors,
  cached,
}: {
  query: SearchCriteria
  registry?: string
  mirrors?: string[]
  cached?: boolean
}): Promise<SearchResults> {
  return fetchFromRegistry({
    endpoint: "/-/v1/search",
    query: normalizeRawSearchCriteria(rawSearchCriteria),
    registry,
    mirrors,
    cached,
  })
}

function normalizeRawSearchCriteria(rawSearchCriteria: SearchCriteria): string {
  // Convert SearchCriteria to a URL query string
  return Object.entries(rawSearchCriteria)
    .filter(([, value]) => ["string", "number"].includes(typeof value))
    .map(([key, value]) => `${key}=${value}`)
    .join("&")
}

/**
 * `SearchResults` contains the results returned by the registry for a query.
 *
 * @see {@link SearchResult}
 * @see {@link https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md#get-v1search}
 */
export interface SearchResults {
  /**
   * List of search results
   *
   * @see {@link SearchResult}
   */
  readonly objects: SearchResult[]

  /**
   * Total number of search results corresponding to a query;
   * may be higher than the number of `objects`
   */
  readonly total: number

  /** Date at which the search happened */
  readonly time: string
}

/**
 * `SearchResult` contains the search result for a single package
 *  and its search score.
 *
 * @see {@link PackageSearchResult}
 * @see {@link SearchScore}
 * @see {@link PackageFlags}
 */
export interface SearchResult {
  /**
   * Abbreviated package metadata
   *
   * @see {@link PackageSearchResult}
   */
  readonly package: PackageSearchResult

  /**
   * Final and detailed search score values
   *
   * @see {@link SearchScore}
   */
  readonly score: SearchScore

  /** Search score value; may be different from `score.final` */
  readonly searchScore: number

  /**
   * Flag attributes for the package
   *
   * @see {@link PackageFlags}
   */
  readonly flags?: PackageFlags
}

/**
 * `PackageSearchResult` contains abbreviated package metadata returned
 * by searching the registry for packages.
 *
 * @see {@link Person}
 * @see {@link PackageLinks}
 */
export interface PackageSearchResult {
  /** Package name */
  readonly name: string

  /** Latest package version number */
  readonly version: string

  /** Package scope; either `unscoped` or the package's scope */
  readonly scope: string

  /** Publishing timestamp for the latest version */
  readonly date: string

  /**
   * Package publisher
   *
   * @see {@link Person}
   */
  readonly publisher: Person

  /**
   * Links for pages associated to the package
   *
   * @see {@link PackageLinks}
   */
  readonly links: PackageLinks

  /** Package description */
  readonly description?: string

  /** Keywords describing the package */
  readonly keywords?: string[]

  /**
   * Package author
   *
   * @see {@link Person}
   */
  readonly author?: Person

  /**
   * Package maintainers
   *
   * @see {@link Person}
   */
  readonly maintainers?: Person[]
}

/**
 * `PackageLinks` contains a collection of links of pages associated to the package.
 */
export interface PackageLinks {
  readonly npm?: string
  readonly homepage?: string
  readonly repository?: string
  readonly bugs?: string
  readonly [key: string]: string | undefined
}

/**
 * `SearchScore` contains the final and detailed search score values.
 *
 * @see {@link SearchScoreDetail}
 */
export interface SearchScore {
  /** Final search score value, computed from the detailed scores */
  readonly final: number

  /**
   * Detailed search score values
   *
   * @see {@link SearchScoreDetail}
   */
  readonly detail: SearchScoreDetail
}

/**
 * `SearchScoreDetail` contains the search score values for the
 * quality, popularity and maintenance categories.
 */
export interface SearchScoreDetail {
  /** Package quality score value */
  readonly quality: number

  /** Package popularity score value */
  readonly popularity: number

  /** Package maintenance score value */
  readonly maintenance: number
}

/**
 * `PackageFlags` contains flag attributes categorizing the package.
 */
export interface PackageFlags {
  /** If true, package version is `<1.0.0` */
  readonly unstable?: boolean

  /** If true, package is insecure or has vulnerable dependencies */
  readonly insecure?: boolean
}

/**
 * `SearchCriteria` represents the available search criteria.
 *
 * @see {@link https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md#get-v1search}
 */
export interface SearchCriteria {
  /**
   * Query text
   *
   * @remarks
   * The following special text attributes can be used to refine results:
   *
   * - `author:<name>`: show packages from the given author
   *   (for example, `author:someone`)
   *
   * - `maintainer:<name>`: show packages with the given maintainer
   *   (for example, `maintainer:someone`)
   *
   * - `keywords:<keyword list>`: show packages matching the given keyword(s);
   *   separators `,`, `+` and `,-` mean respectively `OR`, `AND` and `NOT`
   *   (for example, use `keywords:foo,bar+baz,-quux` to include keywords `foo`
   *   or `bar` and `baz` but not `quux`)
   *
   * - `not:unstable`: exclude unstable packages (version `<1.0.0`)
   *
   * - `not:insecure`: exclude insecure packages
   *
   * - `is:unstable`: include only unstable packages (version `<1.0.0`)
   *
   * - `is:insecure`: include only insecure packages
   *
   * - `boost-exact:<true/false>`: boost packages with exact name match
   *   (default: `true`)
   */
  readonly text?: string

  /** Number of results to return (from `0` to `250`; default: `20` on the npm registry) */
  readonly size?: number

  /** Return results from this offset */
  readonly from?: number

  /** Package quality influence on results (from `0.0` to `1.0`) */
  readonly quality?: number

  /** Package popularity influence on results (from `0.0` to `1.0`) */
  readonly popularity?: number

  /** Package maintenance influence on results (from `0.0` to `1.0`) */
  readonly maintenance?: number
}
