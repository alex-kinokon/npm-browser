import { Classes, H4 } from "@blueprintjs/core"
import { memo } from "react"
import Link from "next/link"
import type { NpmPackage } from "~/remote/npmPackage"
import type { Packument } from "~/vendor/node-query-registry"

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
        {deps.map(dep => (
          <li key={dep}>
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
        {devDeps.length ? <DepList title="Dev Dependencies" deps={devDeps} /> : null}
      </div>
    )
  }
)

export const Dependents = memo(({ npm }: { npm: NpmPackage }) => (
  <div>
    <DepList
      title="Dependents"
      count={npm.dependents.dependentsCount}
      deps={npm.dependents.dependentsTruncated}
    />
  </div>
))
