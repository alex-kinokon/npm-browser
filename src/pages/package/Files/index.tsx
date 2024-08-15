import { basename, dirname } from "node:path"

import { Button, Popover, Position } from "@blueprintjs/core"
import styled from "@emotion/styled"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { useHash } from "~/hooks/useHash"
import { getPackageFiles } from "~/remote"
import type { FileResult } from "~/remote/npmFile"

import { ErrorView, LoadingView } from "../NonIdeal"

import { type PackageIdentifier, TAB } from "../package"

import { CodeView } from "./CodeView"
import { FileNavigation } from "./FileNavigation"
import { FileTreeSidebar } from "./FileTreeDropdown"
import { PathNavigation } from "./PathNavigation"

function mapFile(files?: FileResult["files"]) {
  return Object.values(files ?? {}).map((file) => ({
    ...file,
    basename: basename(file.path),
    dirname: dirname(file.path),
  }))
}
export type MappedFile = ReturnType<typeof mapFile>[number]

export function FileView({ package: pkg }: { package: PackageIdentifier }) {
  const { name, version } = pkg
  const { data, isLoading, isError, error } = useQuery(
    getPackageFiles(name, version),
  )
  const files = useMemo(() => mapFile(data?.files), [data?.files])

  const [hash, setHash] = useHash()
  const path = "/" + (hash[1] ?? "")

  function setPath(path: string) {
    setHash(`${TAB.Code}${path}`)
  }

  if (isLoading) {
    return <LoadingView />
  } else if (isError) {
    return <ErrorView error={error} />
  } else if (!data) {
    return null
  }

  const activeFile = files.find((file) => file.path === path)
  return (
    <div>
      <div css="flex items-center gap-1">
        <Popover
          minimal
          position={Position.BOTTOM_LEFT}
          content={<FileTreeSidebar files={files} onNavigate={setPath} />}
        >
          <Button small minimal icon="path-search" css="-mt-2" />
        </Popover>
        <PathNavigation
          path={path}
          setPath={setPath}
          package={name}
          file={activeFile}
          css="grow"
        />
      </div>
      {activeFile ? (
        <CodeView
          package={pkg}
          file={activeFile}
          files={files}
          setPath={setPath}
          css="grow"
        />
      ) : (
        <FileNavigation package={pkg} data={data} onNavigate={setPath} />
      )}
    </div>
  )
}
