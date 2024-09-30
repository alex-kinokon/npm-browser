import Icon from "@aet/icons/macro"
import { Classes, FormGroup } from "@blueprintjs/core"
import { css, cx } from "@emotion/css"
import { useQuery } from "@tanstack/react-query"
import { memo } from "react"

import { T } from "~/Locale"
import { getGitHubRepo, getPulls } from "~/remote"
import { parseRepo } from "~/utils/parseRepo"
import type { Packument } from "~/vendor/node-query-registry"

export function getRepoURL(data?: Packument) {
  const repoURL =
    typeof data?.repository === "object"
      ? data?.repository?.url
      : data?.repository
  if (repoURL) {
    return { repoURL, ...parseRepo(repoURL) }
  }
}

export const RepositoryView = memo(({ data }: { data?: Packument }) => {
  const repo = getRepoURL(data)
  if (!repo) return null

  return (
    <FormGroup
      label={<T en="Repository" fr="Dépôt" ja="リポジトリ" zh-Hant="儲存庫" />}
    >
      <div>
        <a
          href={repo.repoURL.replace(/^git\+https/, "https")}
          target="_blank"
          rel="noopener noreferrer"
          css="break-words font-narrow tracking-tight"
        >
          {repo.repoURL}
        </a>
      </div>
      <GitHubDataWrapper repo={repo} />
    </FormGroup>
  )
})

const GitHubDataWrapper = memo(
  ({ repo }: { repo: ReturnType<typeof parseRepo> }) => {
    const { owner, repoName } = repo
    if (!owner || !repoName) return null

    return <GitHubData owner={owner} repo={repoName.replace(/\.git$/, "")} />
  },
)

const GitHubData = memo(({ owner, repo }: { owner: string; repo: string }) => {
  const pulls = useQuery({
    queryKey: ["getGitHubPulls", owner, repo],
    queryFn: () => getPulls(owner, repo),
    retry: false,
  })
  const repoData = useQuery({
    queryKey: ["getGitHubRepo", owner, repo],
    queryFn: () => getGitHubRepo(owner, repo),
    retry: false,
  })

  return (
    <div
      css="mt-1.5 flex"
      className={css`font-size: 0.95em; > div { margin-right: 0.5rem; display: flex; align-items: center; } svg { margin-right: 0.2rem; font-size: 1.2em; fill: #1f2328; & { fill: #7d8590; } } .bp5-dark`}
    >
      {!repoData.isError && (
        <div className={cx(repoData.isLoading && Classes.SKELETON)}>
          <Icon icon="VscIssues" />
          <span>{repoData.data?.open_issues_count.toLocaleString()}</span>
        </div>
      )}
      {!repoData.isError && (
        <div className={cx(repoData.isLoading && Classes.SKELETON)}>
          <Icon icon="VscStarFull" />
          <span>{repoData.data?.stargazers_count.toLocaleString()}</span>
        </div>
      )}
      {!pulls.isError && (
        <div className={cx(pulls.isLoading && Classes.SKELETON)}>
          <Icon icon="BiGitPullRequest" />
          <span>{pulls.data?.length.toLocaleString()}</span>
        </div>
      )}
    </div>
  )
})
