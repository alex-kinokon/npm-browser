import { css, cx } from "@emotion/css"
import { Classes, FormGroup } from "@blueprintjs/core"
import { memo } from "react"
import { useQuery } from "@tanstack/react-query"
import Icon from "@aet/icons/macro"
import type { Packument } from "~/vendor/node-query-registry"
import { T } from "~/contexts/Locale"
import { getGitHubRepo, getPulls } from "~/remote"
import { parseRepo } from "~/utils/parseRepo"

export const RepositoryView = memo(({ data }: { data?: Packument }) => {
  const repo =
    typeof data?.repository === "object" ? data?.repository?.url : data?.repository

  if (!repo) return null

  return (
    <FormGroup label={<T en="Repository" fr="Dépôt" ja="リポジトリ" zh-Hant="儲存庫" />}>
      <div>
        <a
          href={repo.replace(/^git\+https/, "https")}
          target="_blank"
          rel="noopener noreferrer"
          className={css`
            word-wrap: break-word;
          `}
        >
          {repo}
        </a>
      </div>
      {false && process.env.NODE_ENV !== "production" && (
        <GitHubDataWrapper repo={repo} />
      )}
    </FormGroup>
  )
})

const GitHubDataWrapper = memo(({ repo }: { repo: string }) => {
  const { owner, repoName } = parseRepo(repo)
  if (!owner || !repoName) return null

  return <GitHubData owner={owner} repo={repoName.replace(/\.git$/, "")} />
})

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
      className={css`
        display: flex;
        font-size: 0.95em;
        margin-top: 6px;
        > div {
          margin-right: 1rem;
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
          {repoData.data?.open_issues_count} issues
        </div>
      )}
      {!pulls.isError && (
        <div className={cx(pulls.isLoading && Classes.SKELETON)}>
          <Icon icon="BiGitPullRequest" />
          {pulls.data?.length} pull requests
        </div>
      )}
    </div>
  )
})
