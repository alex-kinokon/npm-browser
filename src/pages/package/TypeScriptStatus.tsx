import { css } from "@emotion/css"
import { useQuery } from "@tanstack/react-query"
import Icon from "@aet/icons/macro"
import { Link } from "~/vendor/wouter"
import { getPackageInfo } from "~/remote"
import type { PackageIdentifier } from "./package"

export function TypeScriptStatus({
  package: { name },
}: {
  package: PackageIdentifier
}) {
  const { data } = useQuery(getPackageInfo(name))
  const t = data?.capsule?.types?.typescript

  if (!t) {
    return null
  }

  if (t.bundled) {
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
      <Icon icon="SiTypescript" fill="#3178C6" css="ml-[5px] text-[1.3em]" />
    )
  }

  return (
    <Link href={`/package/${t.package}`}>
      <div
        css="ml-[5px] cursor-pointer font-semibold hover:underline"
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
