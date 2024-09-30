import { classed } from "@aet/tailwind/classed"
import { tw } from "@aet/tailwind/macro"
import { Callout, Classes, H4, Intent, Tooltip } from "@blueprintjs/core"
import { ChevronDown, ChevronRight, SmallMinus } from "@blueprintjs/icons"
import { useToggle } from "@react-hookz/web"
import { useQuery } from "@tanstack/react-query"
import clsx from "clsx"
import { useRef } from "react"
import semverMaxSatisfying from "semver/ranges/max-satisfying"

import { getRegistryPackageInfo } from "~/remote"
import { relativeTime } from "~/utils/relativeTime"
import { Link } from "~/vendor/wouter"

const Version = classed("span", tw`text-[var(--color-fg-muted)]`)
const DEPRECATED = tw`italic line-through`

function TreeItem({
  name,
  version,
  isActiveTab,
}: {
  name: string
  version: string
  isActiveTab?: boolean
}) {
  const ref = useRef<HTMLLIElement>(null)
  const [open, toggle] = useToggle(false)

  const query = useQuery({
    ...getRegistryPackageInfo(name),
    enabled: isActiveTab,
  })

  const versions = query.data ? Object.keys(query.data.versions) : undefined
  const matchingVersion = versions
    ? semverMaxSatisfying(versions, version)
    : undefined
  const currentVersion =
    matchingVersion != null ? query.data!.versions[matchingVersion] : undefined
  const data = currentVersion
    ? Object.entries(currentVersion.dependencies ?? {})
    : undefined

  const isDeprecated = currentVersion?.deprecated != null
  const hasNonDeprecatedVersions = versions?.some(
    (v) => !query.data?.versions[v].deprecated,
  )
  const isCompletelyDeprecated = isDeprecated && !hasNonDeprecatedVersions

  const hasNoDeps = data?.length === 0
  const Icon = hasNoDeps ? SmallMinus : open ? ChevronDown : ChevronRight

  const timestamp =
    matchingVersion != null
      ? query.data!.versionsToTimestamps[matchingVersion]
      : undefined

  const timestampLabel = timestamp ? (
    <span>
      {" "}
      (
      {relativeTime(new Date(timestamp), {
        style: "long",
      })}
      )
    </span>
  ) : null

  const deprecateContent = currentVersion ? (
    isDeprecated ? (
      <div>{currentVersion.deprecated}</div>
    ) : (
      <div>
        <div>
          <span css="font-semibold">{currentVersion.name}</span>{" "}
          <span>
            {currentVersion.version}
            {timestampLabel}
          </span>
        </div>
        <div css="text-sm">{currentVersion.description}</div>
      </div>
    )
  ) : undefined

  return (
    <li data-loading={query.isLoading} ref={ref}>
      <div className="group" css="flex items-center gap-1 ps-0">
        <span css="leading-3">
          <Icon
            className={Classes.TREE_NODE_CARET}
            css={["min-w-0 p-0", hasNoDeps && "cursor-default"]}
            onClick={hasNoDeps ? undefined : toggle}
          />
        </span>
        <Tooltip
          intent={isDeprecated ? Intent.WARNING : Intent.NONE}
          placement="top-end"
          popoverClassName={clsx(tw`max-w-96`, !isDeprecated && "intent-none")}
          content={deprecateContent}
          transitionDuration={50}
        >
          {isCompletelyDeprecated ? (
            <div css={DEPRECATED}>
              <Link href={`/package/${name}`}>{name}</Link>
              <Version> {version}</Version>
            </div>
          ) : isDeprecated ? (
            <div>
              <Link href={`/package/${name}`}>{name}</Link>{" "}
              <Version css={DEPRECATED}>{version}</Version>
            </div>
          ) : (
            <div>
              <Link href={`/package/${name}`}>{name}</Link>{" "}
              <Version>{version}</Version>
            </div>
          )}
        </Tooltip>
      </div>
      {!open || hasNoDeps ? null : query.error ? (
        <div css="mb-2 ml-4 mt-1 max-w-96">
          <Callout compact intent={Intent.DANGER} css="rounded-md">
            {(query.error as Error).message}
          </Callout>
        </div>
      ) : data ? (
        <ul className={Classes.LIST} css="ml-0 list-none">
          {data.map(([dep, version]) => (
            <TreeItem
              key={dep}
              name={dep}
              version={version}
              isActiveTab={isActiveTab}
            />
          ))}
        </ul>
      ) : (
        <div className={Classes.SKELETON} css="mb-2 ml-5 mt-1 h-4 w-40" />
      )}
    </li>
  )
}

export function DepList({
  title,
  deps,
  isActiveTab,
}: {
  title: string
  deps: Record<string, string>
  count?: number
  isActiveTab: boolean
}) {
  const entries = Object.entries(deps)
  return (
    <div>
      <H4>
        {title} ({entries.length})
      </H4>
      <ul className={Classes.LIST} css="list-none p-0">
        {entries.map(([dep, version]) => (
          <TreeItem
            isActiveTab={isActiveTab}
            key={dep}
            name={dep}
            version={version}
          />
        ))}
      </ul>
    </div>
  )
}
