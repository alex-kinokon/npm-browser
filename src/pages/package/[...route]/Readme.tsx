import { css } from "@emotion/css"
import { useQuery } from "@tanstack/react-query"
import { Markdown, markdownStyle } from "~/components/Markdown"
import { getPackageFile, getPackageFiles, getReadmeFileHex } from "~/remote"

export function Readme({
  package: name,
  version,
  fallback,
}: {
  package: string
  version: string
  fallback?: string
}) {
  const { data: files } = useQuery(getPackageFiles(name, version))
  const readmeHex = getReadmeFileHex(files)
  const { data: readme } = useQuery(getPackageFile(name, readmeHex))

  return (
    <div
      className={css`
        overflow: hidden;
        pre {
          overflow: scroll;
        }
      `}
    >
      <Markdown className={markdownStyle} source={readme || fallback} />
    </div>
  )
}
