import { useQuery } from "@tanstack/react-query"
import { css, cx } from "@emotion/css"
import { Classes, Colors, Divider, FormGroup, H2, Tab, Tabs } from "@blueprintjs/core"
import styled from "@emotion/styled"
import { useEffect, useState } from "react"
import Link from "next/link"
import { RelativeTime } from "~/utils/relativeTime"
import { getPackageInfo, getRegistryPackageInfo } from "~/remote"
import { Readme } from "./Readme"
import { FileView } from "./Files"
import type { PackageMetadata } from "~/remote/npmPackage"
import type { NpmPackage } from "~/remote/npmPackage2"
import { getFileSize } from "~/utils/fileSize"
import { PageHeader } from "./Header"
import { TypeScriptStatus } from "./TypeScriptStatus"
import { VersionList } from "./Versions"
import { Dependencies, Dependents } from "./Dependencies"
import { Install } from "./InstallInstruction"

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
      </Container>
    </div>
  )
}

const SidebarContainer = styled.div`
  .bp5-label {
    font-weight: 600;
  }
  .bp5-form-content {
    font-size: 1.1em;
  }
`

function Sidebar({
  data,
  npm,
  version,
  package: name,
}: {
  data?: PackageMetadata
  npm?: NpmPackage
  version: string
  package: string
}) {
  const cur = data?.versions[version]

  return (
    <SidebarContainer>
      <Install name={name} />

      <FormGroup label="Repository">
        <a
          href={data?.repository?.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cx(!data && Classes.SKELETON)}
        >
          {data?.repository?.url}
        </a>
      </FormGroup>
      <FormGroup label="Homepage">
        <a
          href={data?.homepage}
          target="_blank"
          rel="noopener noreferrer"
          className={cx(!data && Classes.SKELETON)}
        >
          {data?.homepage}
        </a>
      </FormGroup>
      <FormGroup label="Weekly Downloads">
        <span className={cx(!npm && Classes.SKELETON)}>
          {npm?.downloads.at(-1)?.downloads.toLocaleString()}
        </span>
      </FormGroup>
      <FormGroup label="Version">{version}</FormGroup>
      <FormGroup label="License">
        <span className={cx(!data && Classes.SKELETON)}>
          {data?.license ?? "Unknown"}
        </span>
      </FormGroup>
      <FormGroup label="Unpacked file size">
        <span className={cx(!data && Classes.SKELETON)}>
          {cur?.dist.unpackedSize != null
            ? getFileSize(cur.dist.unpackedSize!)
            : "Unknown"}
        </span>
      </FormGroup>
      <FormGroup label="Total Files">{cur?.dist.fileCount || "N/A"}</FormGroup>
      <FormGroup label="Maintainers">
        {npm?.packument.maintainers.map(maintainer => (
          <Link
            href={`/user/${maintainer.name}`}
            key={maintainer.name}
            title={maintainer.name}
          >
            <img
              key={maintainer.name}
              src={`https://www.npmjs.com/${maintainer.avatars.medium}`}
              height={50}
              width={50}
              alt={maintainer.name}
              className={css`
                border-radius: 5px;
                margin-right: 6px;
                margin-bottom: 6px;
              `}
            />
          </Link>
        ))}
      </FormGroup>
    </SidebarContainer>
  )
}
