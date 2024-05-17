import { useQuery } from "@tanstack/react-query"
import { css } from "@emotion/css"
import { useFirstMountState } from "@react-hookz/web"
import { Classes, Divider, Tab, Tabs } from "@blueprintjs/core"
import styled from "@emotion/styled"
import { useEffect, useMemo } from "react"
import { getRegistryPackageInfo } from "~/remote"
import { Readme } from "./Readme"
import { FileView } from "./Files"
import { PageHeader } from "~/components/Header"
import { VersionList } from "./Versions"
import { Dependencies, Dependents } from "./Dependencies"
import Footer from "~/components/Footer"
import { Sidebar } from "./Sidebar"
import { T } from "~/Locale"
import { Container } from "~/components/Container"
import { Playground } from "./Playground"
import { useHash } from "~/hooks/useHash"
import { PageError } from "~/components/PageError"
import type { Packument } from "~/vendor/node-query-registry"
import { Header } from "./Header"

export interface PackageIdentifier {
  name: string
  version: string
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-template-columns: minmax(0, 1fr) 300px;
  grid-gap: 30px;
  margin-left: -4px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    margin-left: 0;
    > div {
      max-width: 100%;
      overflow: scroll;
    }
  }
`

export const enum TAB {
  Readme = "",
  Code = "code",
  Dependencies = "dependencies",
  Dependents = "dependents",
  Versions = "versions",
  Playground = "playground",
}

export const skeleton = (
  <div className={Classes.SKELETON} style={{ height: 500 }} />
)

function PackagePageGrid({
  id,
  data,
  isLoading,
}: {
  id: PackageIdentifier
  data?: Packument
  isLoading: boolean
}) {
  const { name, version } = id
  const [[activeTab], setHash] = useHash()
  const currentVersion = getCurrentVersion(data, version)
  const isFirstMount = useFirstMountState()

  useEffect(() => {
    if (!isFirstMount) {
      setHash("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, version])

  const depCount = useMemo(
    () =>
      currentVersion
        ? Object.keys(currentVersion.dependencies ?? {}).length
        : undefined,
    [currentVersion],
  )

  return (
    <Grid>
      <div>
        <Header id={id} isLoading={isLoading} data={data} />

        {/* Main */}
        <Tabs
          css="mt-2 overflow-hidden"
          selectedTabId={activeTab}
          className={css`
            .bp5-tab {
              font-size: inherit;
            }
          `}
        >
          <Tab
            id={TAB.Readme}
            title={
              // eslint-disable-next-line jsx-a11y/anchor-is-valid
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setHash("")
                }}
              >
                <T en="Readme" fr="Description" ja="説明" zh-Hant="說明" />
              </a>
            }
            panel={<Readme package={id} fallback={data?.readme} />}
          />
          <Tab
            id={TAB.Code}
            title={
              <a href={`#${TAB.Code}`}>
                <T en="Code" fr="Code" ja="コード" zh-Hant="程式碼" />
              </a>
            }
            panel={version ? <FileView package={id} /> : skeleton}
          />
          <Tab
            id={TAB.Dependencies}
            title={
              <a href={`#${TAB.Dependencies}`}>
                <T
                  en="Dependencies"
                  fr="Dépendances"
                  ja="依存関係"
                  zh-Hant="依賴關係"
                />
                {depCount != null && <sup>{depCount}</sup>}
              </a>
            }
            panel={
              data ? <Dependencies data={data} version={version} /> : skeleton
            }
          />
          <Tab
            id={TAB.Dependents}
            title={
              <a href={`#${TAB.Dependents}`}>
                <T en="Dependents" fr="Dépendants" zh-Hant="相依" />
              </a>
            }
            panel={<Dependents package={id} />}
          />
          <Tab
            id={TAB.Versions}
            title={
              <a href={`#${TAB.Versions}`}>
                <T en="Versions" fr="Versions" ja="バージョン" zh-Hant="版本" />
              </a>
            }
            panel={data ? <VersionList data={data} /> : skeleton}
          />
          {false && (
            <Tab
              id={TAB.Playground}
              disabled
              title={
                <T
                  en="Playground"
                  fr="Playground"
                  ja="プレイグラウンド"
                  zh-Hant="遊樂場"
                />
              }
              panel={<Playground package={id} />}
            />
          )}
        </Tabs>
      </div>

      <Sidebar data={data} package={id} />
    </Grid>
  )
}

export default function PackagePage({
  name,
  version: urlVersion,
}: {
  name: string
  version?: string
}) {
  const { data, isLoading, error, isError } = useQuery(
    getRegistryPackageInfo(name),
  )

  const version = urlVersion ?? data?.["dist-tags"].latest
  const id: PackageIdentifier = useMemo(
    () => ({ name, version: version! }),
    [name, version],
  )

  return (
    <div css={isLoading ? "cursor-wait" : undefined}>
      <PageHeader />
      <title>{name}</title>
      <Container>
        {isError ? (
          <PageError error={error as Error} />
        ) : (
          <PackagePageGrid id={id} data={data} isLoading={isLoading} />
        )}

        <Divider css="-ml-0.5 mt-[40px]" />
        <Footer />
      </Container>
    </div>
  )
}

export function getCurrentVersion(data?: Packument, version?: string) {
  return data && version ? data?.versions[version] : undefined
}
