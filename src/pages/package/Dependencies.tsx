import { Classes, H4 } from "@blueprintjs/core"
import { memo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "~/vendor/wouter"
import { uniq } from "~/utils/uniq"
import type { Packument } from "~/vendor/node-query-registry"
import { type PackageIdentifier, skeleton } from "./package"
import { getPackageInfo } from "~/remote"

function DepList({
  title,
  deps,
  count = deps.length,
}: {
  title: string
  deps: string[]
  count?: number
}) {
  return (
    <div>
      <H4>
        {title} ({count})
      </H4>
      <ul className={Classes.LIST}>
        {deps.map((dep) => (
          <li key={dep} data-key={dep}>
            <Link href={`/package/${dep}`}>{dep}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export const Dependencies = memo(
  ({ data, version }: { data: Packument; version: string }) => {
    const cur = data.versions[version]
    const deps = Object.keys(cur.dependencies ?? {})
    const devDeps = Object.keys(cur.devDependencies ?? {})

    return (
      <div>
        {!deps.length && !devDeps.length && <p>No dependencies.</p>}
        {deps.length ? <DepList title="Dependencies" deps={deps} /> : null}
        {devDeps.length ? (
          <DepList title="Dev Dependencies" deps={devDeps} />
        ) : null}
      </div>
    )
  },
)

export const Dependents = memo(
  ({ package: { name } }: { package: PackageIdentifier }) => {
    const { data: npm, isLoading } = useQuery(getPackageInfo(name))
    if (isLoading) {
      return skeleton
    }
    if (!npm?.dependents) {
      return null
    }

    return (
      <div>
        <DepList
          title="Dependents"
          count={npm.dependents.dependentsCount}
          deps={uniq(npm.dependents.dependentsTruncated)}
        />
      </div>
    )
  },
)
