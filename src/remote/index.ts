import type { IssuesResult } from "./githubIssues"
import type { PullsResult } from "./githubPull"
import type { FileResult } from "./npmFile"
import type { NpmPackage } from "./npmPackage"
import type { NpmUser } from "./npmUser"
import { queryOptions } from "~/utils/queryType"
import * as npm from "~/vendor/node-query-registry"
import type { GithubRepo } from "./githubRepo"

if (typeof window !== "undefined") {
  // onlineManager.setOnline(false)
}

// Endpoints
/** @deprecated */
const npmMirror = "/api/npm"
const npmjs = "https://www.npmjs.com"
const github = "https://api.github.com"

async function get<T>(url: string) {
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  })
  if (!res.ok) {
    if (process.env.NODE_ENV === "development") {
      console.error(url)
    }
    throw new Error(
      `Request failed with status ${res.status} ${res.statusText}`,
    )
  }
  return res.json() as Promise<T>
}

export function getSearchSuggestions(params: npm.SearchCriteria) {
  return queryOptions({
    queryKey: ["getSearchSuggestions", JSON.stringify(params)],
    enabled: !!params.text,
    queryFn: () =>
      npm.searchPackages({
        query: params,
      }),
  })
}

export function getRegistryPackageInfo(name: string) {
  return queryOptions({
    queryKey: ["getRegistryPackageInfo", name],
    queryFn: () => npm.getPackument({ name }),
    retry: false,
  })
}

export function getPackageFiles(name: string, version: string) {
  return queryOptions({
    queryKey: ["getPackageFiles", name, version],
    enabled: !!version,
    queryFn: () =>
      get<FileResult>(`${npmjs}/package/${name}/v/${version}/index`),
    retry: false,
  })
}

export function getPulls(owner: string, repo: string): Promise<PullsResult[]> {
  return get(`${github}/repos/${owner}/${repo}/pulls`)
}

export function getIssues(owner: string, repo: string): Promise<IssuesResult> {
  return get(`${github}/repos/${owner}/${repo}/issues`)
}

export function getGitHubRepo(owner: string, repo: string) {
  return get<GithubRepo>(`${github}/repos/${owner}/${repo}`)
}

/**
 * @deprecated This is private API.
 */
export function getPackageInfo(name: string) {
  return queryOptions({
    queryKey: ["getPackageInfo", name],
    queryFn: () => get<NpmPackage>(`${npmMirror}/${name}`),
  })
}

/**
 * @deprecated This is private API.
 */
export function getUserInfo(name: string) {
  return queryOptions({
    queryKey: ["getUserInfo", name],
    queryFn: () => get<NpmUser>(`${npmMirror}/~${name}`),
  })
}

export function getPackageFile(name: string, hex?: string) {
  return queryOptions({
    queryKey: ["getPackageFile", hex || null],
    enabled: !!hex,
    queryFn: () =>
      fetch(`${npmjs}/package/${name}/file/${hex}`).then((res) => res.text()),
  })
}
