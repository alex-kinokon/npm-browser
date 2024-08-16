import { Classes, Divider, Tab, Tabs } from "@blueprintjs/core"
import { css } from "@emotion/css"
import styled from "@emotion/styled"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { Container } from "~/components/Container"
import Footer from "~/components/Footer"
import { PageHeader } from "~/components/Header"
import { PageError } from "~/components/PageError"
import { useHash } from "~/hooks/useHash"
import { T } from "~/Locale"
import { getRegistryPackageInfo } from "~/remote"
import type { Packument } from "~/vendor/node-query-registry"

import { Dependencies, Dependents } from "./Dependencies"
import { FileView } from "./Files"

import { Header } from "./Header"
import { Playground } from "./Playground"
import { Readme } from "./Readme"
import { Sidebar } from "./Sidebar"
import { VersionList } from "./Versions"

export interface PackageIdentifier {
  name: string
  version: string
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-template-columns: minmax(0, 1fr) 300px;
  grid-gap: 30px;
  position: relative;
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

const README_LABEL = <T en="Readme" fr="Description" ja="説明" zh-Hant="說明" />
const CODE_LABEL = <T en="Code" fr="Code" ja="コード" zh-Hant="程式碼" />
const DEPENDENCIES_LABEL = (
  <T en="Dependencies" fr="Dépendances" ja="依存関係" zh-Hant="依賴關係" />
)
const DEPENDENTS_LABEL = <T en="Dependents" fr="Dépendants" zh-Hant="相依" />
const VERSIONS_LABEL = (
  <T en="Versions" fr="Versions" ja="バージョン" zh-Hant="版本" />
)
const PLAYGROUND_LABEL = (
  <T en="Playground" fr="Playground" ja="プレイグラウンド" zh-Hant="遊樂場" />
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
  const { version } = id
  const [[activeTab], setHash] = useHash()

  const currentVersion = getCurrentVersion(data, version)

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
                {README_LABEL}
              </a>
            }
            panel={<Readme package={id} data={data} />}
          />
          <Tab
            id={TAB.Code}
            title={<a href={`#${TAB.Code}`}>{CODE_LABEL}</a>}
            panel={version ? <FileView package={id} /> : skeleton}
          />
          <Tab
            id={TAB.Dependencies}
            title={
              <a href={`#${TAB.Dependencies}`}>
                {DEPENDENCIES_LABEL}
                {depCount != null && <sup>{depCount}</sup>}
              </a>
            }
            panel={
              data ? (
                <Dependencies
                  data={data}
                  version={version}
                  isActiveTab={activeTab === (TAB.Dependencies as string)}
                />
              ) : (
                skeleton
              )
            }
          />
          <Tab
            id={TAB.Dependents}
            title={<a href={`#${TAB.Dependents}`}>{DEPENDENTS_LABEL}</a>}
            panel={<Dependents package={id} />}
          />
          <Tab
            id={TAB.Versions}
            title={<a href={`#${TAB.Versions}`}>{VERSIONS_LABEL}</a>}
            panel={data ? <VersionList data={data} /> : skeleton}
          />
          {false && (
            <Tab
              id={TAB.Playground}
              disabled
              title={PLAYGROUND_LABEL}
              panel={<Playground package={id} />}
            />
          )}
        </Tabs>
      </div>

      <div>
        <Sidebar css="sticky top-20" data={data} package={id} />
      </div>
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
