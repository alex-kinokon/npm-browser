import { css } from "@emotion/css"
import { useQuery } from "@tanstack/react-query"
import { Markdown, markdownStyle } from "~/components/Markdown"
import { getPackageFile, getPackageFiles, getReadmeFileHex } from "~/remote"
import type { PackageIdentifier } from "./package"

export function Readme({
  package: { name, version },
  fallback,
}: {
  package: PackageIdentifier
  fallback?: string
}) {
  const { data: files } = useQuery(getPackageFiles(name, version))
  const readmeHex = getReadmeFileHex(files)
  const { data: readme } = useQuery(getPackageFile(name, readmeHex))

  const code = readme || fallback
  if (typeof code !== "string") return null

  return (
    <div
      className={css`
        overflow: hidden;
        pre {
          overflow: scroll;
        }
      `}
    >
      <Markdown className={markdownStyle} source={code} />
    </div>
  )
}
