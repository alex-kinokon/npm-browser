import { useQuery } from "@tanstack/react-query"
import { css, cx } from "@emotion/css"
import { Classes, Colors, Divider, H2, Tab, Tabs } from "@blueprintjs/core"
import styled from "@emotion/styled"
import { useEffect, useState } from "react"
import Head from "next/head"
import { RelativeTime } from "~/utils/relativeTime"
import { getPackageInfo, getRegistryPackageInfo } from "~/remote"
import { Readme } from "./Readme"
import { FileView } from "./Files"
import { PageHeader } from "./Header"
import { TypeScriptStatus } from "./TypeScriptStatus"
import { VersionList } from "./Versions"
import { Dependencies, Dependents } from "./Dependencies"
import Footer from "~/components/Footer"
import { Sidebar } from "./Sidebar"

const flex = css`
  display: flex;
  align-items: center;
`

const Container = styled.div`
  margin: 20px 60px;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-gap: 30px;
  margin-left: -4px;
`

const enum TAB {
  Readme,
  Code,
  Dependencies,
  Dependents,
  Versions,
}

const skeleton = <div className={Classes.SKELETON} style={{ height: 500 }} />

export function PackagePage({ name, version }: { name: string; version?: string }) {
  const { data, isLoading } = useQuery(getRegistryPackageInfo(name))
  const { data: npm, isLoading: isNPMLoading } = useQuery(getPackageInfo(name, version))

  const [activeTab, setActiveTab] = useState<TAB>(TAB.Readme)

  useEffect(() => {
    setActiveTab(TAB.Readme)
  }, [name, version])

  const ver = version ?? data?.["dist-tags"].latest

  return (
    <div className={isLoading ? css({ cursor: "wait" }) : undefined}>
      <PageHeader />

      <Head>
        <title>{name}</title>
      </Head>

      <Container>
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
            <TypeScriptStatus npm={npm} />
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
            <div className={cx(isNPMLoading && Classes.SKELETON)}>
              Scope:{" "}
              {npm?.private ? (
                <span style={{ color: Colors.RED4 }}>Private</span>
              ) : (
                <span style={{ color: Colors.GREEN4 }}>Public</span>
              )}
            </div>{" "}
            <Divider />
            <div className={cx(isLoading && Classes.SKELETON)}>
              Published{" "}
              {data?.time != null && <RelativeTime date={new Date(data.time[ver!])} />}
            </div>
          </div>
        </div>

        <Grid>
          {/* Main */}
          <Tabs
            className={css`
              overflow: hidden;
              padding-top: 4px;
              padding-left: 4px;
              .bp5-tab {
                font-size: inherit;
              }
            `}
            selectedTabId={activeTab}
            onChange={id => setActiveTab(id as TAB)}
          >
            <Tab
              id={TAB.Readme}
              title="Readme"
              panel={<Readme package={name} version={ver!} />}
            />
            <Tab
              id={TAB.Code}
              title="Code"
              panel={ver ? <FileView package={name} version={ver} /> : skeleton}
            />
            <Tab
              id={TAB.Dependencies}
              title="Dependencies"
              panel={data ? <Dependencies data={data} version={ver!} /> : skeleton}
            />
            <Tab
              id={TAB.Dependents}
              title="Dependents"
              panel={npm ? <Dependents npm={npm} /> : skeleton}
            />
            <Tab
              id={TAB.Versions}
              title="Versions"
              panel={data ? <VersionList data={data} /> : skeleton}
            />
          </Tabs>

          <Sidebar data={data} version={ver!} npm={npm} package={name} />
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
