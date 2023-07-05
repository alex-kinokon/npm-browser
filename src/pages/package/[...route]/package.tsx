import { useQuery } from "@tanstack/react-query"
import { css, cx } from "@emotion/css"
import { Classes, Colors, Divider, H2, Tab, Tabs } from "@blueprintjs/core"
import styled from "@emotion/styled"
import { useEffect, useMemo, useState } from "react"
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

const enum TAB {
  Readme,
  Code,
  Dependencies,
  Dependents,
  Versions,
  Playground,
}

export const skeleton = <div className={Classes.SKELETON} style={{ height: 500 }} />

export default function PackagePage({
  name,
  version,
}: {
  name: string
  version?: string
}) {
  const { data, isLoading } = useQuery(getRegistryPackageInfo(name))
  const ver = version ?? data?.["dist-tags"].latest
  const id: PackageIdentifier = useMemo(() => ({ name, version: ver! }), [name, ver])

  const [activeTab, setActiveTab] = useState<TAB>(TAB.Readme)
  const isPrivate = false as boolean

  useEffect(() => {
    setActiveTab(TAB.Readme)
  }, [name, version])

  return (
    <div className={isLoading ? css({ cursor: "wait" }) : undefined}>
      <PageHeader />

      <Head>
        <title>{name}</title>
      </Head>

      <Container>
        <Grid>
          <div>
            <div
              className={css`
                margin-bottom: 5px;
              `}
            >
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
              onChange={id => setActiveTab(id as TAB)}
            >
              <Tab
                id={TAB.Readme}
                title={<T en="Readme" fr="Description" ja="説明" zh-Hant="說明" />}
                panel={<Readme package={id} fallback={data?.readme} />}
              />
              <Tab
                id={TAB.Code}
                title={<T en="Code" fr="Code" ja="コード" zh-Hant="程式碼" />}
                panel={ver ? <FileView package={id} /> : skeleton}
              />
              <Tab
                id={TAB.Dependencies}
                title={
                  <T
                    en="Dependencies"
                    fr="Dépendances"
                    ja="依存関係"
                    zh-Hant="依賴關係"
                  />
                }
                panel={data ? <Dependencies data={data} version={ver!} /> : skeleton}
              />
              <Tab
                id={TAB.Dependents}
                title={<T en="Dependents" fr="Dépendants" zh-Hant="相依" />}
                panel={<Dependents package={id} />}
              />
              <Tab
                id={TAB.Versions}
                title={<T en="Versions" fr="Versions" ja="バージョン" zh-Hant="版本" />}
                panel={data ? <VersionList data={data} /> : skeleton}
              />
              <Tab
                id={TAB.Playground}
                title={
                  <T
                    en="Playground"
                    fr="Playground"
                    ja="プレイグラウンド"
                    zh-Hant="遊樂場"
                  />
                }
                panel={<Playground package={id} active={activeTab === TAB.Playground} />}
              />
            </Tabs>
          </div>

          <Sidebar data={data} package={id} />
        </Grid>

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
