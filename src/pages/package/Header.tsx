import {
  Callout,
  Classes,
  Colors,
  Divider,
  H2,
  H5,
  Intent,
} from "@blueprintjs/core"
import { css, cx } from "@emotion/css"
import { type PackageIdentifier, getCurrentVersion } from "./package"
import { T } from "~/Locale"
import { TypeScriptStatus } from "./TypeScriptStatus"
import { RelativeTime } from "~/utils/relativeTime"
import type { Packument } from "~/vendor/node-query-registry"

export function Header({
  id,
  isLoading,
  data,
}: {
  id: PackageIdentifier
  isLoading: boolean
  data: Packument | undefined
}) {
  const { name, version } = id
  const currentVersion = getCurrentVersion(data, version)
  // This is available from getPackageInfo(), but it’s a private API that we’re deprecating
  const isPrivate = false as boolean

  return (
    <div css="mb-1">
      {currentVersion?.deprecated && (
        <Callout intent={Intent.WARNING} css="my-2.5">
          <H5>
            <T
              en="This package has been deprecated"
              fr="Ce package a été déprécié"
              ja="このパッケージは非推奨です"
              zh-Hant="此套件已被廢棄"
            />
          </H5>
          <div>{currentVersion.deprecated}</div>
        </Callout>
      )}

      <div css="mb-2.5 flex items-center">
        <H2
          className={css`
            margin: 0;
            padding: 0;
            margin-right: 3px;
          `}
        >
          {name}
        </H2>{" "}
        <TypeScriptStatus package={id} />
      </div>
      <div
        css="flex items-center"
        className={css`
          .bp5-divider {
            height: 1em;
          }
        `}
      >
        <div>{version}</div> <Divider />
        <div>
          Scope:{" "}
          {isPrivate ? (
            <span style={{ color: Colors.RED4 }}>Private</span>
          ) : (
            <span style={{ color: Colors.GREEN4 }}>Public</span>
          )}
        </div>{" "}
        <Divider />
        <PublicationTime isLoading={isLoading} time={data?.time[version]} />
      </div>
    </div>
  )
}

export function PublicationTime({
  className,
  isLoading,
  time,
}: {
  className?: string
  isLoading: boolean
  time?: string
}) {
  return (
    <div className={cx(isLoading && Classes.SKELETON, className)}>
      <T en="Published " fr="Publié " zh-Hant="發佈於 " />
      {time != null && <RelativeTime date={new Date(time)} />}
    </div>
  )
}
