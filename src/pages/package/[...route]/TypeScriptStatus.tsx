import { css } from "@emotion/css"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { SiTypescript } from "react-icons/si"
import { getPackageInfo } from "~/remote"
import type { PackageIdentifier } from "./package"

export function TypeScriptStatus({ package: { name } }: { package: PackageIdentifier }) {
  const { data } = useQuery(getPackageInfo(name))
  const t = data?.capsule.types?.typescript

  if (!t) {
    return null
  }

  if (t.bundled) {
    if (name.startsWith("@types/")) {
      const pkgName = name.slice("@types/".length).replace(/^(\w+)__(.+)$/, "$1/$2")
      return (
        <Link
          href={`/package/${pkgName}`}
          className={css`
            display: flex;
            margin-left: 5px;
          `}
        >
          <SiTypescript
            fill="#3178C6"
            className={css`
              font-size: 1.3em;
            `}
          />
        </Link>
      )
    }

    return (
      <SiTypescript
        fill="#3178C6"
        className={css`
          margin-left: 5px;
          font-size: 1.3em;
        `}
      />
    )
  }

  return (
    <Link
      href={`/package/${t.package}`}
      className={css`
        border: 1px solid #3178c6;
        color: #3178c6;
        font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto;
        font-size: 0.8em;
        font-weight: 600;
        margin-left: 5px;
        padding: 1px;
      `}
    >
      <div>DT</div>
    </Link>
  )
}
