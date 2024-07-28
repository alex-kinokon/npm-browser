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
}: {
  title: string
  deps: Record<string, string>
  count?: number
}) {
  const entries = Object.entries(deps)
  return (
    <div className="wmde-markdown-var">
      <H4>
        {title} ({entries.length})
      </H4>
      <ul className={Classes.LIST}>
        {entries.map(([dep, version]) => (
          <li key={dep} data-key={dep}>
            <Link href={`/package/${dep}`}>{dep}</Link>{" "}
            <span css="text-[var(--color-fg-muted)]">{version}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export const Dependencies = memo(
  ({ data, version }: { data: Packument; version: string }) => {
    const {
      dependencies = {},
      devDependencies = {},
      peerDependencies = {},
    } = data.versions[version]

    const hasDeps = hasKey(dependencies)
    const hasDevDeps = hasKey(devDependencies)
    const hasPeerDeps = hasKey(peerDependencies)

    return (
      <div css="flex flex-col gap-2">
        {!hasDeps && !hasDevDeps && !hasPeerDeps && <p>No dependencies.</p>}
        {hasDeps ? <DepList title="Dependencies" deps={dependencies} /> : null}
        {hasDevDeps ? (
          <DepList title="Dev Dependencies" deps={devDependencies} />
        ) : null}
        {hasPeerDeps ? (
          <DepList title="Peer Dependencies" deps={peerDependencies} />
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
        <div>
          <H4>Dependents (npm.dependents.dependentsCount)</H4>
          <ul className={Classes.LIST}>
            {uniq(npm.dependents.dependentsTruncated).map((dep) => (
              <li key={dep} data-key={dep}>
                <Link href={`/package/${dep}`}>{dep}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  },
)

function hasKey(obj: object) {
  for (const _ in obj) {
    return true
  }
  return false
}
