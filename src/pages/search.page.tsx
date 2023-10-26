import styled from "@emotion/styled"
import {
  Card,
  Classes,
  Divider,
  FormGroup,
  H4,
  Radio,
  RadioGroup,
  Tag,
} from "@blueprintjs/core"
import { useQuery } from "@tanstack/react-query"
import { css, cx } from "@emotion/css"
import { memo, useCallback, useMemo } from "react"
import { Link } from "wouter"
import Icon from "@aet/icons/macro"
import { ChevronLeft, ChevronRight, GitRepo, Home, Unlock } from "@blueprintjs/icons"
import ReactPaginate from "react-paginate"
import { Head } from "~/components/Head"
import { PageHeader } from "~/components/Header"
import Footer from "~/components/Footer"
import { useSearchParams } from "~/hooks/useSearchParams"
import { getSearchSuggestions } from "~/remote"
import { useDebouncedValue } from "~/hooks/useDebouncedValue"
import { RelativeTime } from "~/utils/relativeTime"
import { T, useT } from "~/contexts/Locale"
import { uniq } from "~/utils/uniq"
import { Container } from "~/components/Container"
import { parseRepo } from "~/utils/parseRepo"

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-template-columns: minmax(0, 1fr) 300px;
  grid-gap: 30px;
  margin-left: -4px;
`

const enum SortBy {
  SearchScore = "default",
  Optimal = "optimal",
  Popularity = "popularity",
  Quality = "quality",
  Maintenance = "maintenance",
}

const PER_PAGE = 25

export default function SearchPage() {
  const t = useT()
  const [{ query, ranking = SortBy.SearchScore, page = 0 }, setQuery] = useSearchParams<{
    query: string
    ranking: SortBy
    page: number
  }>({ query: "" }, { page: Number })

  const debouncedQuery = useDebouncedValue(query, 500)
  const from = page * PER_PAGE

  const { data, isLoading } = useQuery(
    getSearchSuggestions({ text: debouncedQuery, size: 25, from })
  )

  const updateQuery = useCallback((query: string) => setQuery({ query }), [setQuery])

  const sorted = useMemo(() => {
    const objects = data?.objects
    if (!objects) return []

    switch (ranking) {
      case SortBy.SearchScore:
        return objects.sort((a, b) => b.searchScore - a.searchScore)
      case SortBy.Popularity:
        return objects.sort(
          (a, b) => b.score.detail.popularity - a.score.detail.popularity
        )
      case SortBy.Quality:
        return objects.sort((a, b) => b.score.detail.quality - a.score.detail.quality)
      case SortBy.Maintenance:
        return objects.sort(
          (a, b) => b.score.detail.maintenance - a.score.detail.maintenance
        )
      case SortBy.Optimal:
        return objects.sort((a, b) => b.score.final - a.score.final)
    }
  }, [data, ranking])

  return (
    <div>
      <Head>
        <title>npm-browser</title>
      </Head>

      <PageHeader defaultQuery={query} />

      <Container>
        <Grid>
          <div>
            <div
              className={cx(
                css`
                  margin-bottom: 5px;
                `,
                isLoading && Classes.SKELETON
              )}
            >
              {data?.total.toLocaleString()}{" "}
              <T en=" results" fr=" résultats" zh-Hant=" 結果" />
            </div>
            {sorted.map(({ flags, package: pkg, score, searchScore }) => (
              <div
                key={pkg.name}
                data-score={JSON.stringify({ flags, ...score, searchScore })}
                className={css`
                  padding: 10px 0;
                `}
              >
                <div
                  className={css`
                    display: flex;
                    align-items: center;
                    margin-bottom: 5px;
                  `}
                >
                  {!!flags?.insecure && (
                    <Unlock
                      title={t({
                        en: "This package has security vulnerabilities",
                        fr: "Ce paquet a des vulnérabilités de sécurité",
                        ja: "このパッケージにはセキュリティ脆弱性があります",
                        "zh-Hant": "此套件存在安全漏洞",
                      })}
                      className={cx(
                        Classes.INTENT_DANGER,
                        css`
                          margin-right: 7px;
                        `
                      )}
                    />
                  )}

                  <Link
                    href={`/package/${pkg.name}`}
                    className={css`
                      font-weight: 500;
                      font-size: 1.3em;
                    `}
                  >
                    {pkg.name}
                  </Link>

                  {pkg.name === query && (
                    <span
                      className={css`
                        margin-left: 10px;
                        margin-top: 3px;
                        opacity: 0.8;
                      `}
                    >
                      <T en="exact match" fr="correspondance exacte" zh-Hant="完全匹配" />
                    </span>
                  )}

                  <div
                    className={css`
                      margin-left: 3px;
                      a {
                        margin-left: 8px;
                        margin-top: 5px;
                        color: unset;
                        opacity: 0.8;
                        &:hover {
                          opacity: 1;
                        }
                      }
                    `}
                  >
                    <RepoLink repo={pkg.links.repository} />
                    {pkg.links.homepage != null &&
                      pkg.links.homepage !== pkg.links.repository && (
                        <a
                          href={pkg.links.homepage}
                          rel="noopener noreferrer"
                          title={t({
                            en: "Homepage",
                            fr: "Page d'accueil",
                            ja: "ホームページ",
                            "zh-Hant": "主頁",
                          })}
                        >
                          <Home />
                        </a>
                      )}
                  </div>
                </div>
                <div
                  className={css`
                    max-width: calc(min(600px, 80vw));
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    margin-bottom: 5px;
                  `}
                >
                  {pkg.description}
                </div>
                {!!pkg.keywords?.length && (
                  <div
                    className={css`
                      margin-bottom: 5px;
                    `}
                  >
                    {uniq(pkg.keywords).map(keyword => (
                      <Tag
                        key={keyword}
                        minimal
                        className={css`
                          margin-right: 6px;
                          cursor: pointer;
                          line-height: 1.5em;
                          &:hover {
                            text-decoration: underline;
                          }
                        `}
                        onClick={() => updateQuery(keyword)}
                      >
                        {keyword}
                      </Tag>
                    ))}
                  </div>
                )}
                <div
                  className={css`
                    margin-top: 6px;
                  `}
                >
                  <a
                    href={
                      pkg.publisher
                        ? `https://www.npmjs.com/~${pkg.publisher?.username}`
                        : "#"
                    }
                  >
                    {pkg.publisher?.username ?? "Unknown user"}
                  </a>{" "}
                  <T en="published" fr="a publié" zh-Hant="發佈了" /> {pkg.version} •{" "}
                  <RelativeTime date={pkg.date} />
                </div>
              </div>
            ))}

            {data != null && data.total > PER_PAGE && (
              <div
                className={css`
                  margin-top: 20px;
                `}
              >
                <ReactPaginate
                  pageCount={Math.ceil(data.total / PER_PAGE)}
                  forcePage={page}
                  onPageChange={({ selected }) => setQuery({ page: selected })}
                  containerClassName={css`
                    display: flex;
                    list-style-type: none;
                    padding: 0;
                  `}
                  previousLabel={<ChevronLeft />}
                  nextLabel={<ChevronRight />}
                  previousClassName={paginateLabel}
                  breakClassName={paginateLabel}
                  pageClassName={cx(
                    paginateLabel,
                    css`
                      display: block;
                      margin-right: 10px;
                      &.selected {
                        font-weight: 500;
                      }
                    `
                  )}
                />
              </div>
            )}
          </div>

          <div>
            <Card>
              <H4>
                <T
                  en="Search options"
                  fr="Options de recherche"
                  ja="検索オプション"
                  zh-Hant="搜索選項"
                />
              </H4>
              <FormGroup>
                <RadioGroup
                  label={
                    <T en="Sort by" fr="Trier par" ja="並び替え" zh-Hant="排序方式" />
                  }
                  onChange={e => setQuery({ ranking: e.currentTarget.value as SortBy })}
                  selectedValue={ranking}
                >
                  <Radio
                    label={
                      (
                        <T en="Default" fr="Défaut" ja="デフォルト" zh-Hant="默認" />
                      ) as any
                    }
                    value={SortBy.SearchScore}
                  />
                  <Radio
                    label={
                      (<T en="Optimal" fr="Optimal" ja="最適" zh-Hant="最佳" />) as any
                    }
                    value={SortBy.Optimal}
                  />
                  <Radio
                    label={
                      (
                        <T en="Popularity" fr="Popularité" ja="人気" zh-Hant="流行度" />
                      ) as any
                    }
                    value={SortBy.Popularity}
                  />
                  <Radio
                    label={
                      (<T en="Quality" fr="Qualité" ja="品質" zh-Hant="質量" />) as any
                    }
                    value={SortBy.Quality}
                  />
                  <Radio
                    label={
                      (
                        <T
                          en="Maintenance"
                          fr="Maintenance"
                          ja="メンテナンス"
                          zh-Hant="維護"
                        />
                      ) as any
                    }
                    value={SortBy.Maintenance}
                  />
                </RadioGroup>
              </FormGroup>
            </Card>
          </div>
        </Grid>

        <Divider />
        <Footer />
      </Container>
    </div>
  )
}

const paginateLabel = css`
  display: block;
  margin-right: 10px;
  &.disabled a {
    cursor: not-allowed;
    color: inherit;
    opacity: 0.5;
  }
  &.selected a {
    cursor: text;
    color: inherit;
    &:hover {
      text-decoration: none;
    }
  }
`

const repoIcon = css`
  margin-bottom: -3px;
  display: inline-block;
  font-size: 1.1em;
`

const RepoLink = memo(({ repo }: { repo?: string }) => {
  if (!repo) return null

  const { host } = parseRepo(repo)
  switch (host) {
    case "github":
      return (
        <a href={repo} rel="noopener noreferrer">
          <Icon icon="SiGithub" className={repoIcon} />
        </a>
      )
    case "gitlab":
      return (
        <a href={repo} rel="noopener noreferrer">
          <Icon icon="SiGitlab" className={repoIcon} />
        </a>
      )
    default:
      return (
        <a href={repo} rel="noopener noreferrer">
          <GitRepo />
        </a>
      )
  }
})
