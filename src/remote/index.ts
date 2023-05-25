import { onlineManager } from "@tanstack/react-query"
import getRegistry from "~/pages/api/registry/[...route].page"
import type { IssuesResult } from "./githubIssues"
import type { PullsResult } from "./githubPull"
import type { FileResult } from "./npmFile"
import type { PackageMetadata } from "./npmPackage"
import type { NpmPackage } from "./npmPackage2"
import type { NpmSearchResult } from "./npmSearch"
import getNPM from "~/pages/api/npm/[...route].page"
import { queryOptions } from "~/utils/queryType"

if (typeof window !== "undefined") {
  // onlineManager.setOnline(false)
}

function isomorphicFetch(url: string, init?: RequestInit) {
  if (typeof window === "undefined") {
    if (url.startsWith("/api/registry")) {
      return getRegistry({ url: `http://localhost${url}` } as any)
    } else if (url.startsWith("/api/npm")) {
      return getNPM({ url: `http://localhost${url}` } as any)
    }
  }

  return fetch(url, init)
}

async function get<T>(url: string, contentType = "application/json") {
  const res = await isomorphicFetch(url, {
    method: "GET",
    headers: { "Content-Type": contentType },
  })
  if (!res.ok) {
    if (process.env.NODE_ENV === "development") console.error(url)
    throw new Error(`Request failed with status ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function getSearchSuggestions(params: {
  /** full-text search to apply */
  text: string
  /** how many results should be returned (default 20, max 250) */
  size?: number
  /** offset to return results from */
  from?: number
  /** how much of an effect should quality have on search results */
  quality?: number
  /** how much of an effect should popularity have on search results */
  popularity?: number
  /** how much of an effect should maintenance have on search results */
  maintenance?: number
}): Promise<NpmSearchResult> {
  return get(`/api/registry/-/v1/search?${new URLSearchParams(params as any)}`)
}

export function getRegistryPackageInfo(name: string, version?: string) {
  return queryOptions({
    queryKey: ["getRegistryPackageInfo", name, version || null],
    queryFn: () =>
      get<PackageMetadata>(`/api/registry/${name}` + (version ? `/${version}` : "")),
  })
}

export function getPackageFiles(name: string, version: string) {
  return queryOptions({
    queryKey: ["getPackageFiles", name, version],
    queryFn: () => get<FileResult>(`/api/npm/package/${name}/v/${version}/index`),
  })
}

export function getPulls(owner: string, repo: string): Promise<PullsResult> {
  return get(`https://api.github.com/repos/${owner}/${repo}/pulls`)
}

export function getIssues(owner: string, repo: string): Promise<IssuesResult> {
  return get(`https://api.github.com/repos/${owner}/${repo}/issues`)
}

export function getPackageInfo(name: string, version?: string) {
  return queryOptions({
    queryKey: ["getPackageInfo", name, version || null],
    queryFn: () => get<NpmPackage>(`/api/npm/${name}` + (version ? `/v/${version}` : "")),
  })
}

export function getPackageFile(name: string, hex?: string) {
  return queryOptions({
    queryKey: ["getPackageFile", hex || null],
    enabled: !!hex,
    queryFn: () =>
      fetch(`https://www.npmjs.com/package/${name}/file/${hex}`).then(res => res.text()),
  })
}

export function getReadmeFileHex(result?: FileResult) {
  if (!result) return

  const files = new Map(
    Object.values(result.files).map(f => [f.path.toLowerCase(), f.hex])
  )

  return files.get("/readme.md") ?? files.get("/readme") ?? files.get("/readme.txt")
}
