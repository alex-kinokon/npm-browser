export function parseRepo(repo: string): {
  owner?: string
  repoName?: string
  host?: "github" | "gitlab"
} {
  let copy = repo
  if (copy.startsWith("git+")) {
    copy = copy.slice(4)
  }

  const url = new URL(copy)
  if (url.hostname !== "github.com" && url.hostname !== "gitlab.com") {
    return {}
  }

  let [owner, repoName] = url.pathname.slice(1).split("/")
  if (repoName.endsWith(".git")) {
    repoName = repoName.slice(0, -4)
  }

  return {
    owner,
    repoName,
    host: url.hostname === "github.com" ? "github" : "gitlab",
  }
}
