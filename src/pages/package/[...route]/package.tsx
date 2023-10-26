import { useQuery } from "@tanstack/react-query"
import { css, cx } from "@emotion/css"
import { useFirstMountState } from "@react-hookz/web"
import {
  Callout,
  Classes,
  Colors,
  Divider,
  H2,
  H5,
  Intent,
  NonIdealState,
  Tab,
  Tabs,
} from "@blueprintjs/core"
import styled from "@emotion/styled"
import { useEffect, useMemo } from "react"
import { Error } from "@blueprintjs/icons"
import { Head } from "~/components/Head"
import { RelativeTime } from "~/utils/relativeTime"
import { getRegistryPackageInfo } from "~/remote"
import { Readme } from "./Readme"
import { FileView } from "./Files"
import { PageHeader } from "~/components/Header"
import { TypeScriptStatus } from "./TypeScriptStatus"
import { VersionList } from "./Versions"
import { Dependencies, Dependents } from "./Dependencies"
import Footer from "~/components/Footer"
import { Sidebar } from "./Sidebar"
import { T } from "~/contexts/Locale"
import { Container } from "~/components/Container"
import { Playground } from "./Playground"
import { useHash } from "~/hooks/useHash"

export interface PackageIdentifier {
  name: string
  version: string
}

const flex = css`
  display: flex;
  align-items: center;
`

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

export const skeleton = <div className={Classes.SKELETON} style={{ height: 500 }} />

export default function PackagePage({
  name,
  version,
}: {
  name: string
  version?: string
}) {
  const { data, isLoading, error, isError } = useQuery(getRegistryPackageInfo(name))

  const ver = version ?? data?.["dist-tags"].latest
  const id: PackageIdentifier = useMemo(() => ({ name, version: ver! }), [name, ver])

  const [[activeTab], setHash] = useHash()

  const currentVersion = data && ver ? data?.versions[ver] : undefined

  // This is available from getPackageInfo(), but it’s a private API that we’re deprecating
  const isPrivate = false as boolean

  const depCount = useMemo(
    () =>
      currentVersion ? Object.keys(currentVersion.dependencies ?? {}).length : undefined,
    [currentVersion]
  )

  const isFirstMount = useFirstMountState()

  useEffect(() => {
    if (!isFirstMount) {
      setHash("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, version])

  return (
    <div className={isLoading ? css({ cursor: "wait" }) : undefined}>
      <PageHeader />

      <Head>
        <title>{name}</title>
      </Head>

      <Container data-v={currentVersion?.deprecated}>
        {isError ? (
          <div
            className={css`
              margin: 70px 0;
            `}
          >
            <NonIdealState
              icon={<Error size={48} />}
              title={<T en="Error" fr="Erreur" ja="エラー" zh-Hant="錯誤" />}
              description={(error as Error).message ?? "Unknown error"}
            />
          </div>
        ) : (
          <Grid>
            <div>
              <div
                className={css`
                  margin-bottom: 5px;
                `}
              >
                {currentVersion?.deprecated && (
                  <Callout
                    intent={Intent.WARNING}
                    className={css`
                      margin: 10px 0;
                    `}
                  >
                    <H5>
                      <T
                        en="This package has been deprecated"
                        fr="Ce package a été déprécié"
                        ja="このパッケージは非推奨です"
                        zh-Hant="此套件已被廢棄"
                      />
                    </H5>
                    <div>{currentVersion.deprecated}</div>
                  </Callout>
                )}

                <div
                  className={cx(
                    flex,
                    css`
                      margin-bottom: 7px;
                    `
                  )}
                >
                  <H2
                    className={css`
                      margin: 0;
                      padding: 0;
                      margin-right: 3px;
                    `}
                  >
                    {name}
                  </H2>{" "}
                  <TypeScriptStatus package={id} />
                </div>
                <div
                  className={css`
                    ${flex};
                    .bp5-divider {
                      height: 1em;
                    }
                  `}
                >
                  <div>{ver}</div> <Divider />
                  <div>
                    Scope:{" "}
                    {isPrivate ? (
                      <span style={{ color: Colors.RED4 }}>Private</span>
                    ) : (
                      <span style={{ color: Colors.GREEN4 }}>Public</span>
                    )}
                  </div>{" "}
                  <Divider />
                  <div className={cx(isLoading && Classes.SKELETON)}>
                    <T en="Published " fr="Publié " zh-Hant="發佈於 " />
                    {data?.time != null && (
                      <RelativeTime date={new Date(data.time[ver!])} />
                    )}
                  </div>
                </div>
              </div>
              {/* Main */}
              <Tabs
                className={css`
                  overflow: hidden;
                  padding-top: 4px;
                  padding-left: 4px;
                  padding-bottom: 4px;
                  padding-right: 4px;
                  margin-left: -4px;
                  .bp5-tab {
                    font-size: inherit;
                  }
                `}
                selectedTabId={activeTab}
              >
                <Tab
                  id={TAB.Readme}
                  title={
                    // eslint-disable-next-line jsx-a11y/anchor-is-valid
                    <a
                      href="#"
                      onClick={e => {
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
                  panel={ver ? <FileView package={id} /> : skeleton}
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
                  panel={data ? <Dependencies data={data} version={ver!} /> : skeleton}
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
                    panel={
                      <Playground
                        package={id}
                        // active={activeTab === TAB.Playground} />
                      />
                    }
                  />
                )}
              </Tabs>
            </div>

            <Sidebar data={data} package={id} />
          </Grid>
        )}

        <Divider
          className={css`
            margin-top: 40px;
            margin-left: -2px;
          `}
        />
        <Footer />
      </Container>
    </div>
  )
}
