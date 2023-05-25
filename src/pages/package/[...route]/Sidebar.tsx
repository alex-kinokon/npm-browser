import { css, cx } from "@emotion/css"
import { Classes, FormGroup } from "@blueprintjs/core"
import styled from "@emotion/styled"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import type { NpmPackage } from "~/remote/npmPackage"
import { getFileSize } from "~/utils/fileSize"
import { Install } from "./InstallInstruction"
import type { Packument } from "~/vendor/node-query-registry"
import { getPackageDownloads } from "~/vendor/node-query-registry"

export function Sidebar({
  data,
  npm: _npm,
  version,
  package: name,
}: {
  data?: Packument
  npm?: NpmPackage
  version: string
  package: string
}) {
  const { data: downloads } = useQuery({
    queryKey: ["getPackageDownloads", name, "last-week"],
    queryFn: () => getPackageDownloads({ name, period: "last-week" }),
  })

  const cur = data?.versions[version]
  const repo =
    typeof data?.repository === "object" ? data?.repository?.url : data?.repository

  return (
    <SidebarContainer>
      <Install name={name} />

      <FormGroup label="Repository">
        <a
          href={repo}
          target="_blank"
          rel="noopener noreferrer"
          className={cx(
            !data && Classes.SKELETON,
            css`
              word-wrap: break-word;
            `
          )}
        >
          {repo}
        </a>
      </FormGroup>
      <FormGroup label="Homepage">
        <a
          href={data?.homepage}
          target="_blank"
          rel="noopener noreferrer"
          className={cx(
            !data && Classes.SKELETON,
            css`
              word-wrap: break-word;
            `
          )}
        >
          {data?.homepage}
        </a>
      </FormGroup>
      <FormGroup label="Weekly Downloads">
        <span className={cx(!downloads && Classes.SKELETON)}>
          {downloads?.downloads.toLocaleString()}
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
        {_npm?.packument.maintainers.map(maintainer => (
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

const SidebarContainer = styled.div`
  .bp5-label {
    font-weight: 600;
  }
  .bp5-form-content {
    font-size: 1.1em;
  }
`
