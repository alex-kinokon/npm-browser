import Icon from "@aet/icons/macro"
import { css } from "@emotion/css"
import { useQuery } from "@tanstack/react-query"

import { useT } from "~/Locale"
import { getPackageInfo } from "~/remote"
import { Link } from "~/vendor/wouter"

import type { PackageIdentifier } from "./package"

export function TypeScriptStatus({
  package: { name },
}: {
  package: PackageIdentifier
}) {
  const { data } = useQuery(getPackageInfo(name))
  const t = useT()
  const ts = data?.capsule?.types?.typescript

  if (!ts) {
    return null
  }

  if (ts.bundled) {
    if (name.startsWith("@types/")) {
      const pkgName = name
        .slice("@types/".length)
        .replace(/^(\w+)__(.+)$/, "$1/$2")

      return (
        <Link href={`/package/${pkgName}`}>
          <Icon
            icon="SiTypescript"
            title={pkgName}
            fill="#3178C6"
            className={css`
              cursor: pointer;
              font-size: 1.3em;
              display: flex;
              margin-left: 5px;
            `}
          />
        </Link>
      )
    }

    return (
      <Icon
        title={t({
          en: "This package has bundled TypeScript definitions.",
          fr: "Ce paquet a des définitions TypeScript intégrées.",
          "zh-Hant": "此套件已捆綁 TypeScript 定義。",
          ja: "このパッケージにはバンドルされた TypeScript 定義があります。",
        })}
        icon="SiTypescript"
        fill="#3178C6"
        css="ml-[5px] text-[1.3em]"
      />
    )
  }

  return (
    <Link href={`/package/${ts.package}`}>
      <div
        css="ml-[5px] cursor-pointer font-semibold hover:underline"
        title={t({
          en: "This package has available TypeScript definitions.",
          fr: "Ce paquet a des définitions TypeScript disponibles.",
          "zh-Hant": "此套件有可用的 TypeScript 定義。",
          ja: "このパッケージには利用可能な TypeScript 定義があります。",
        })}
        className={css`
          border: 1px solid #3178c6;
          color: #3178c6;
          font-family:
            "Segoe UI",
            -apple-system,
            BlinkMacSystemFont,
            Roboto;
          font-size: 0.8em;
          padding: 1px;
        `}
      >
        DT
      </div>
    </Link>
  )
}
