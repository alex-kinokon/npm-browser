import type { GitRepository } from "../types/gitRepository"
import type { Repository } from "../types/repository"

export function normalizeRawLicense(rawLicense?: any): string | undefined {
  if (rawLicense && typeof rawLicense === "string") {
    return rawLicense
  }
}

export function normalizeRawRepository(rawRepository?: any): GitRepository | undefined {
  if (isRepository(rawRepository)) {
    return normalizeRepository(rawRepository)
  } else if (typeof rawRepository === "string") {
    return normalizeRepository({ url: rawRepository })
  }
}

function isRepository(rawRepository: any): rawRepository is Repository {
  return (
    rawRepository &&
    typeof rawRepository === "object" &&
    typeof rawRepository.url === "string" &&
    ["string", "undefined"].includes(typeof rawRepository.type) &&
    ["string", "undefined"].includes(typeof rawRepository.directory)
  )
}

function normalizeRepository(rawRepository: Repository): GitRepository | undefined {
  const { url, directory } = rawRepository

  const parsedUrl = parseGitURL(url)
  if (!parsedUrl) {
    return
  }

  return {
    type: "git",
    url: parsedUrl,
    directory,
  }
}

function parseGitURL(url: string): string | undefined {
  const urlWithProtocol = url.includes(":")
    ? // A normal URL or a shortcut like `github:user/repository`
      url
    : // The short form github shortcut `user/repository`
    url.includes("/")
    ? `github:${url}`
    : // Not a URL
      ""

  try {
    const { protocol, hostname, pathname } = new URL(urlWithProtocol)
    const cleanPathname = pathname.replace(/\.git$/, "")
    if (protocol === "github:" || hostname === "github.com") {
      return "https://github.com" + cleanPathname
    }
    if (protocol === "gist:" || hostname === "gist.github.com") {
      return "https://gist.github.com" + cleanPathname
    }
    if (protocol === "bitbucket:" || hostname === "bitbucket.org") {
      return "https://bitbucket.org" + cleanPathname
    }
    if (protocol === "gitlab:" || hostname === "gitlab.com") {
      return "https://gitlab.com" + cleanPathname
    }
    return urlWithProtocol
  } catch {}
}
