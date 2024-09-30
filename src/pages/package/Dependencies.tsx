import { Classes, H4 } from "@blueprintjs/core"
import { useQuery } from "@tanstack/react-query"
import { memo } from "react"

import { getPackageInfo } from "~/remote"
import { uniq } from "~/utils/uniq"
import type { Packument } from "~/vendor/node-query-registry"
import { Link } from "~/vendor/wouter"

import { DepList } from "./DepTree"
import { type PackageIdentifier, skeleton } from "./package"

export const Dependencies = memo(
  ({
    data,
    version,
    isActiveTab,
  }: {
    data: Packument
    version: string
    isActiveTab: boolean
  }) => {
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
        {hasDeps ? (
          <DepList
            title="Dependencies"
            deps={dependencies}
            isActiveTab={isActiveTab}
          />
        ) : null}
        {hasDevDeps ? (
          <DepList
            title="Dev Dependencies"
            deps={devDependencies}
            isActiveTab={isActiveTab}
          />
        ) : null}
        {hasPeerDeps ? (
          <DepList
            title="Peer Dependencies"
            deps={peerDependencies}
            isActiveTab={isActiveTab}
          />
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
