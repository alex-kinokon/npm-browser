import { css, cx } from "@emotion/css"
import { Classes, FormGroup } from "@blueprintjs/core"
import { memo } from "react"
import { useQuery } from "@tanstack/react-query"
import Icon from "@aet/icons/macro"
import type { Packument } from "~/vendor/node-query-registry"
import { T } from "~/Locale"
import { getGitHubRepo, getPulls } from "~/remote"
import { parseRepo } from "~/utils/parseRepo"

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
          css="font-narrow break-words"
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
      className={css`
        font-size: 0.95em;
        > div {
          margin-right: 0.5rem;
          display: flex;
          align-items: center;
        }
        svg {
          margin-right: 0.2rem;
          font-size: 1.2em;
          fill: #1f2328;
          .bp5-dark & {
            fill: #7d8590;
          }
        }
      `}
    >
      {!repoData.isError && (
        <div className={cx(repoData.isLoading && Classes.SKELETON)}>
          <Icon icon="VscIssues" />
          <span css="font-narrow">{repoData.data?.open_issues_count}</span>
        </div>
      )}
      {!repoData.isError && (
        <div className={cx(repoData.isLoading && Classes.SKELETON)}>
          <Icon icon="VscStarFull" />
          <span css="font-narrow">{repoData.data?.stargazers_count}</span>
        </div>
      )}
      {!pulls.isError && (
        <div className={cx(pulls.isLoading && Classes.SKELETON)}>
          <Icon icon="BiGitPullRequest" />
          <span css="font-narrow">{pulls.data?.length}</span>
        </div>
      )}
    </div>
  )
})
