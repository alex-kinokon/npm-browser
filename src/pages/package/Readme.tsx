import { css } from "@emotion/css"
import { useQuery } from "@tanstack/react-query"
import { ExcludeRow } from "@blueprintjs/icons"
import { Markdown, markdownStyle } from "~/components/Markdown"
import { getPackageFile, getPackageFiles } from "~/remote"
import type { RehypeRewriteOptions } from "rehype-rewrite"
import type { Packument } from "~/vendor/node-query-registry"
import type { PackageIdentifier } from "./package"
import type { FileResult } from "~/remote/npmFile"
import { getRepoURL } from "./Sidebar/Repository"
import { Card, NonIdealState } from "@blueprintjs/core"
import { T } from "~/Locale"

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
    return (
      <div css="mx-auto my-8 max-w-[40rem] rounded-lg border border-solid border-gray-200 bg-gray-50 px-5 py-4 dark:border-none dark:bg-gray-800">
        <div css="flex gap-2 text-gray-600 dark:text-gray-100">
          <ExcludeRow size={20} />
          <div>
            <div css="mb-1 font-semibold">
              <T
                en="No README"
                fr="Pas de README"
                ja="README がありません"
                zh-Hant="沒有 README"
              />
            </div>
            <div>
              <T
                en="No README was found for this package."
                fr="Aucun fichier README n’a été trouvé pour ce paquet."
                ja="このパッケージに README は見つかりませんでした。"
                zh-Hant="找不到此套件的 README。"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const rehypeRewrite: RehypeRewriteOptions["rewrite"] = (node) => {
    if (repoUrl?.host === "github") {
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
  }

  return (
    <div
      css="overflow-hidden"
      className={css`
        pre {
          overflow: scroll;
        }
      `}
    >
      <Markdown
        className={markdownStyle}
        source={code}
        rehypeRewrite={(node) => {
          try {
            rehypeRewrite(node)
          } catch {}
        }}
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
