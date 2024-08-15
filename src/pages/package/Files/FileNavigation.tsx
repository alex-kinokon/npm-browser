import { basename, dirname, extname } from "node:path"

import Icon from "@aet/icons/macro"
import { Document, FolderClose } from "@blueprintjs/icons"
import { css } from "@emotion/css"
import styled from "@emotion/styled"
import { memo, useMemo } from "react"

import { useHash } from "~/hooks/useHash"
import type { FileResult } from "~/remote/npmFile"
import { getFileSize } from "~/utils/fileSize"

import type { PackageIdentifier } from "../package"

function mapFile(files?: FileResult["files"]) {
  return Object.values(files ?? {}).map((file) => ({
    ...file,
    basename: basename(file.path),
    dirname: dirname(file.path),
  }))
}
export type MappedFile = ReturnType<typeof mapFile>[number]

export function FileNavigation({
  package: pkg,
  data,
  onNavigate,
}: {
  package: PackageIdentifier
  data: FileResult
  onNavigate(path: string): void
}) {
  const files = useMemo(() => mapFile(data?.files), [data?.files])

  const [hash] = useHash()
  const path = "/" + (hash[1] ?? "")

  const directories = useMemo(() => {
    const set = new Set<string>()
    for (const { dirname: dir } of files) {
      let name = dir
      while (name !== "/") {
        set.add(name)
        name = dirname(name)
      }
    }
    return Array.from(set).map((dir) => ({
      dirname: dir,
      parent: dir === "/" ? undefined : dirname(dir),
    }))
  }, [files])

  const childFiles = files
    .filter((file) => file.dirname === path)
    .sort((a, b) => a.basename.localeCompare(b.basename))
  const childDirs = directories.filter((dir) => dir.parent === path)

  return (
    <div>
      <ul
        className={css`
          list-style: none;
          padding: 0;
          margin: 0;
        `}
      >
        {path !== "/" && (
          <Li className={grid} onClick={() => onNavigate(dirname(path))}>
            <IconDiv>
              <FolderClose />
            </IconDiv>
            <Name>..</Name>
            <Type />
            <Size />
          </Li>
        )}

        {childDirs.map((dir) => (
          <Li
            className={grid}
            key={dir.dirname}
            onClick={() => onNavigate(dir.dirname)}
          >
            <IconDiv>
              <FolderClose className={iconClass} />
            </IconDiv>
            <Name>{basename(dir.dirname)}</Name>
            <Type>directory</Type>
            <Size css="text-right">
              {files.filter((file) => file.dirname === dir.dirname).length}{" "}
              files
            </Size>
          </Li>
        ))}
        {childFiles.map((file) => (
          <FileItem key={file.path} file={file} setPath={onNavigate} />
        ))}
      </ul>
    </div>
  )
}

const FileItem = memo<{
  file: MappedFile
  setPath: (path: string) => void
}>(({ file, setPath }) => (
  <Li className={grid} onClick={() => setPath(file.path)}>
    <IconDiv>{getIcon(file.basename)}</IconDiv>
    <Name>{file.basename}</Name>
    <Type>{file.contentType}</Type>
    <Size css="text-right">{getFileSize(file.size)}</Size>
  </Li>
))

// childDirs
const grid = css`
  display: grid;
  grid-template-columns: 20px 55% 1fr 0.3fr;
  @media (max-width: 600px) {
    grid-template-columns: 20px 73% 1fr 0.3fr;
  }
`

const Li = styled.li`
  margin: 9px 0;
`
const IconDiv = styled.div`
  display: flex;
  align-items: center;
`
const Name = styled.div`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`
const Type = styled.div`
  @media (max-width: 600px) {
    display: none;
  }
`
const Size = styled.div``

const iconClass = css`
  fill: light-dark(#5f6b7c, #abb3bf);
`

export function getIcon(fileName: string) {
  fileName = fileName.toLowerCase()

  if (fileName.startsWith("license")) {
    return <Icon icon="GrCertificate" className={iconClass} />
  }

  switch (extname(fileName)) {
    case ".map":
      return <Icon icon="FaMap" className={iconClass} />
    case ".js":
    case ".mjs":
      return <Icon icon="SiJavascript" className={iconClass} />
    case ".ts":
    case ".tsx":
      return <Icon icon="SiTypescript" className={iconClass} />
    case ".md":
      return <Icon icon="SiMarkdown" className={iconClass} />
    case ".scss":
    case ".sass":
      return <Icon icon="SiSass" className={iconClass} />
    case ".css":
      return <Icon icon="SiCss3" className={iconClass} />
    case ".json":
      return <Icon icon="SiJson" className={iconClass} />
    case ".html":
      return <Icon icon="SiHtml5" className={iconClass} />
    case ".node":
      return <Icon icon="BsFillFileBinaryFill" className={iconClass} />
    default:
      return <Document />
  }
}
