import { css } from "@emotion/css"
import { useQuery } from "@tanstack/react-query"
import { Markdown, markdownStyle } from "~/components/Markdown"
import { getPackageFile, getPackageFiles } from "~/remote"
import type { Packument } from "~/vendor/node-query-registry"
import type { PackageIdentifier } from "./package"
import type { FileResult } from "~/remote/npmFile"
import { getRepoURL } from "./Sidebar/Repository"

export function Readme({
  package: { name, version },
  data,
}: {
  package: PackageIdentifier
  data?: Packument
}) {
  const fallback = data?.readme
  const { data: files } = useQuery(getPackageFiles(name, version))
  const readmeHex = getReadmeFileHex(files)
  const { data: readme } = useQuery(getPackageFile(name, readmeHex))

  const repoUrl = getRepoURL(data)

  const code = readme || fallback
  // registry.npmjs.org can return the string "[object Object]"
  if (typeof code !== "string" || !code || code === "[object Object]") {
    return null
  }

  return (
    <div
      className={css`
        overflow: hidden;
        pre {
          overflow: scroll;
        }
      `}
    >
      <Markdown
        className={markdownStyle}
        source={code}
        rehypeRewrite={
          repoUrl?.host === "github"
            ? (node) => {
                if (
                  node.type === "element" &&
                  node.tagName === "img" &&
                  typeof node.properties.src === "string" &&
                  !/^https?:\/\//.test(node.properties.src)
                ) {
                  const url = new URL(
                    node.properties.src,
                    `https://raw.githubusercontent.com/${repoUrl.owner}/${repoUrl.repoName}/HEAD/`,
                  ).href
                  node.properties.src = url
                }
              }
            : undefined
        }
      />
    </div>
  )
}

function getReadmeFileHex(result?: FileResult) {
  if (!result) return

  const files = new Map(
    Object.values(result.files).map((f) => [f.path.toLowerCase(), f.hex]),
  )

  return (
    files.get("/readme.md") ?? files.get("/readme") ?? files.get("/readme.txt")
  )
}
