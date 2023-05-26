import { Button, Classes, Code, H4 } from "@blueprintjs/core"
import { ChevronDown, ChevronUp } from "@blueprintjs/icons"
import { memo, useMemo, useState } from "react"
import { Link } from "wouter"
import { css } from "@emotion/css"
import { RelativeTime } from "~/utils/relativeTime"
import type { Packument } from "~/vendor/node-query-registry"

export const VersionList = memo(({ data }: { data: Packument }) => {
  const versions = useMemo(() => Object.keys(data.versions).reverse(), [data.versions])
  const distTags = useMemo(() => Object.entries(data.distTags), [data.distTags])
  const [showAll, setShowAll] = useState(false)

  return (
    <div>
      <H4>Current tags:</H4>
      <ul className={Classes.LIST}>
        {distTags.map(([tag, version]) => (
          <li key={tag}>
            <Link href={`/package/${data.name}/v/${version}`}>{version}</Link>
            <Code
              className={css`
                font-size: 1em;
                margin-left: 3px;
                margin-right: 3px;
              `}
            >
              {tag}
            </Code>
            (<RelativeTime date={new Date(data.time[version])} />)
          </li>
        ))}
      </ul>

      <H4>
        Versions ({versions.length}){" "}
        {versions.length > 20 && (
          <Button
            minimal
            small
            onClick={() => setShowAll(!showAll)}
            icon={showAll ? <ChevronUp /> : <ChevronDown />}
          />
        )}
      </H4>

      <ul className={Classes.LIST}>
        {versions.slice(0, showAll ? versions.length : 20).map(version => (
          <li key={version}>
            <Link href={`/package/${data.name}/v/${version}`}>{version}</Link> (
            <RelativeTime date={new Date(data.time[version])} />)
          </li>
        ))}
      </ul>
    </div>
  )
})
