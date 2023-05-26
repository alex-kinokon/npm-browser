import { basename, dirname, extname } from "path"
import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { css } from "@emotion/css"
import { Document, FolderClose } from "@blueprintjs/icons"
import styled from "@emotion/styled"
import {
  SiCss3,
  SiHtml5,
  SiJavascript,
  SiJson,
  SiMarkdown,
  SiSass,
  SiTypescript,
} from "react-icons/si"
import { GrCertificate } from "react-icons/gr"
import { BsFillFileBinaryFill } from "react-icons/bs"
import { FaMap } from "react-icons/fa"
import { getFileSize } from "~/utils/fileSize"
import { getPackageFiles } from "~/remote"
import { CodeView } from "./CodeView"
import { PathNavigation } from "./PathNavigation"
import { ErrorView, LoadingView } from "../NonIdeal"
import type { PackageIdentifier } from "../package"
import type { FileResult } from "~/remote/npmFile"

function mapFile(files?: FileResult["files"]) {
  return Object.values(files ?? {}).map(file => ({
    ...file,
    basename: basename(file.path),
    dirname: dirname(file.path),
  }))
}
export type MappedFile = ReturnType<typeof mapFile>[number]

export function FileView({ package: { name, version } }: { package: PackageIdentifier }) {
  const { data, isLoading, isError, error } = useQuery(getPackageFiles(name, version))

  const [path, setPath] = useState("/")

  useEffect(() => {
    setPath("/")
  }, [name, version])

  const files = useMemo(() => mapFile(data?.files), [data?.files])

  const directories = useMemo(() => {
    const set = new Set<string>()
    for (const { dirname: dir } of files) {
      let name = dir
      while (name !== "/") {
        set.add(name)
        name = dirname(name)
      }
    }
    return Array.from(set).map(dir => ({
      dirname: dir,
      parent: dir === "/" ? undefined : dirname(dir),
    }))
  }, [files])

  if (isLoading) {
    return <LoadingView />
  } else if (isError) {
    return <ErrorView error={error} />
  } else if (!data) {
    return null
  }

  const activeFile = files.find(file => file.path === path)
  if (activeFile) {
    return (
      <Container>
        <PathNavigation path={path} setPath={setPath} package={name} />
        <CodeView package={name} file={activeFile} files={files} setPath={setPath} />
      </Container>
    )
  }

  const list = files.filter(file => file.dirname === path)
  const childDirs = directories.filter(dir => dir.parent === path)

  return (
    <Container>
      <PathNavigation path={path} setPath={setPath} package={name} />
      <ul
        className={css`
          list-style: none;
          padding: 0;
          margin: 0;
        `}
      >
        {path !== "/" && (
          <Li className={grid} onClick={() => setPath(dirname(path))}>
            <Icon>
              <FolderClose />
            </Icon>
            <Name>..</Name>
            <Type />
            <Size />
          </Li>
        )}

        {childDirs.map(dir => (
          <Li className={grid} key={dir.dirname} onClick={() => setPath(dir.dirname)}>
            <Icon>
              <FolderClose />
            </Icon>
            <Name>{basename(dir.dirname)}</Name>
            <Type>directory</Type>
            <Size
              className={css`
                text-align: right;
              `}
            >
              {files.filter(file => file.dirname === dir.dirname).length} files
            </Size>
          </Li>
        ))}
        {list.map(file => (
          <Li className={grid} key={file.path} onClick={() => setPath(file.path)}>
            <Icon>{getIcon(file.basename)}</Icon>
            <Name>{file.basename}</Name>
            <Type>{file.contentType}</Type>
            <Size
              className={css`
                text-align: right;
              `}
            >
              {getFileSize(file.size)}
            </Size>
          </Li>
        ))}
      </ul>
    </Container>
  )
}

const Container = styled.div``

// childDirs
const grid = css`
  display: grid;
  grid-template-columns: 20px 55% 1fr 0.3fr;
`

const Li = styled.li`
  margin: 9px 0;
`
const Icon = styled.div`
  display: flex;
  align-items: center;
  svg {
    fill: #5f6b7c;
    .bp5-dark & {
      fill: #abb3bf;
    }
  }
`
const Name = styled.div`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`
const Type = styled.div``
const Size = styled.div``

function getIcon(fileName: string) {
  fileName = fileName.toLowerCase()

  if (fileName.startsWith("license")) {
    return <GrCertificate />
  }

  switch (extname(fileName)) {
    case ".map":
      return <FaMap />
    case ".js":
    case ".mjs":
      return <SiJavascript />
    case ".ts":
    case ".tsx":
      return <SiTypescript />
    case ".md":
      return <SiMarkdown />
    case ".scss":
    case ".sass":
      return <SiSass />
    case ".css":
      return <SiCss3 />
    case ".json":
      return <SiJson />
    case ".html":
      return <SiHtml5 />
    case ".node":
      return <BsFillFileBinaryFill />
    default:
      return <Document />
  }
}
