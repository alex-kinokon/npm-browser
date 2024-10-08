import { Classes, Divider, FormGroup } from "@blueprintjs/core"
import { css, cx } from "@emotion/css"
import styled from "@emotion/styled"

import { T } from "~/Locale"
import { getFileSize } from "~/utils/fileSize"
import type { Packument } from "~/vendor/node-query-registry"

import { Install } from "../InstallInstruction"
import type { PackageIdentifier } from "../package"

import { DownloadsView } from "./Downloads"
import { LinksView } from "./Links"
import { MaintainersView } from "./Maintainers"
import { RepositoryView } from "./Repository"

export function Sidebar({
  data,
  package: pkg,
  className,
}: {
  data?: Packument
  package: PackageIdentifier
  className?: string
}) {
  const { name, version } = pkg
  const cur = data?.versions[version]

  return (
    <SidebarContainer className={className}>
      <Divider
        className={css`
          margin-bottom: 20px;
          @media (min-width: 768px) {
            display: none;
          }
        `}
      />
      <Install name={name} />
      <RepositoryView data={data} />

      <FormGroup
        label={
          <T
            en="Homepage"
            fr="Page d’accueil"
            ja="ホームページ"
            zh-Hant="首頁"
          />
        }
      >
        <a
          href={data?.homepage}
          target="_blank"
          rel="noopener noreferrer"
          css="break-words"
          className={cx(!data && Classes.SKELETON)}
        >
          {data?.homepage}
        </a>
      </FormGroup>

      <DownloadsView package={name} />
      <LinksView package={name} />

      <FormGroup
        label={<T en="Version" fr="Version" ja="バージョン" zh-Hant="版本" />}
      >
        {version}
      </FormGroup>

      <FormGroup
        label={
          <T en="License" fr="Licence" ja="ライセンス" zh-Hant="授權條款" />
        }
      >
        <span className={cx(!data && Classes.SKELETON)}>
          {data?.license ?? "Unknown"}
        </span>
      </FormGroup>

      <FormGroup
        label={
          <T
            en="Unpacked File Size"
            fr="Taille des fichiers décompressés"
            ja="展開後のファイルサイズ"
            zh-Hant="解壓縮後檔案大小"
          />
        }
      >
        <span className={cx(!data && Classes.SKELETON)}>
          {cur?.dist.unpackedSize != null
            ? getFileSize(cur.dist.unpackedSize)
            : "Unknown"}
        </span>
      </FormGroup>

      <FormGroup
        label={
          <T
            en="Total Files"
            fr="Nombre total de fichiers"
            ja="ファイル数"
            zh-Hant="檔案數"
          />
        }
      >
        {cur?.dist.fileCount || "N/A"}
      </FormGroup>

      <MaintainersView package={name} />
    </SidebarContainer>
  )
}

const SidebarContainer = styled.div`
  margin-top: 15px;
  .bp5-label {
    font-weight: 600;
  }
  .bp5-form-content {
    font-size: 1.1em;
  }
`
