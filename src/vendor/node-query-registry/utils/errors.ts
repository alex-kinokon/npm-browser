/**
 * `FetchError` represents an error that happened when fetching a URL.
 *
 * The `instanceof` operator can be used to check for this error.
 */
export class FetchError extends Error {
  constructor(
    /** URL originally fetched */
    readonly url: string,

    /** Response received */
    readonly response: Response
  ) {
    let message = `fetch: request to ${url} failed`
    if (response.status) {
      message += ` with status ${response.status}`
    }
    super(message)
  }
}

/**
 * `InvalidPackageNameError` is thrown when the name of a package
 * is not valid according to the npm registry naming rules.
 *
 * The `instanceof` operator can be used to check for this error.
 *
 * @see {@link https://www.npmjs.com/package/validate-npm-package-name}
 */
export class InvalidPackageNameError extends Error {}

/**
 * `InvalidPackageVersionError` is thrown when a package's version does not exist.
 *
 * The `instanceof` operator can be used to check for this error.
 */
export class InvalidPackageVersionError extends Error {}
