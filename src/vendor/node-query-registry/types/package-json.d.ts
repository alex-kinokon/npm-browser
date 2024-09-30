export type { PackageJson } from "zod-package-json"

/**
 * `BugTracker` represents the bug tracking methods.
 */
export interface BugTracker {
  readonly url?: string
  readonly email?: string
}
