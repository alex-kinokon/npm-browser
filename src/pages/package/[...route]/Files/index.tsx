import { basename, dirname, extname } from "node:path"
import { memo, useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { css } from "@emotion/css"
import { Document, FolderClose } from "@blueprintjs/icons"
import styled from "@emotion/styled"
import Icon from "@aet/icons/macro"
import { useFirstMountState } from "@react-hookz/web"
import { getFileSize } from "~/utils/fileSize"
import { getPackageFiles } from "~/remote"
import { CodeView } from "./CodeView"
import { PathNavigation } from "./PathNavigation"
import { ErrorView, LoadingView } from "../NonIdeal"
import { type PackageIdentifier, TAB } from "../package"
import type { FileResult } from "~/remote/npmFile"
import { useHash } from "~/hooks/useHash"

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
  const [hash, setHash] = useHash()
  const path = "/" + (hash[1] ?? "")
  const isFirstMount = useFirstMountState()

  function setPath(path: string) {
    setHash(`${TAB.Code}${path}`)
  }

  useEffect(() => {
    if (!isFirstMount) {
      setPath("/")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    return Array.from(set).map((dir) => ({
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

  const activeFile = files.find((file) => file.path === path)
  if (activeFile) {
    return (
      <Container>
        <PathNavigation
          path={path}
          setPath={setPath}
          package={name}
          file={activeFile}
        />
        <CodeView
          package={pkg}
          file={activeFile}
          files={files}
          setPath={setPath}
        />
      </Container>
    )
  }

  const list = files
    .filter((file) => file.dirname === path)
    .sort((a, b) => a.basename.localeCompare(b.basename))
  const childDirs = directories.filter((dir) => dir.parent === path)

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
            onClick={() => setPath(dir.dirname)}
          >
            <IconDiv>
              <FolderClose />
            </IconDiv>
            <Name>{basename(dir.dirname)}</Name>
            <Type>directory</Type>
            <Size
              className={css`
                text-align: right;
              `}
            >
              {files.filter((file) => file.dirname === dir.dirname).length}{" "}
              files
            </Size>
          </Li>
        ))}
        {list.map((file) => (
          <FileItem key={file.path} file={file} setPath={setPath} />
        ))}
      </ul>
    </Container>
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
    <Size
      className={css`
        text-align: right;
      `}
    >
      {getFileSize(file.size)}
    </Size>
  </Li>
))

const Container = styled.div``

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
const Type = styled.div`
  @media (max-width: 600px) {
    display: none;
  }
`
const Size = styled.div``

function getIcon(fileName: string) {
  fileName = fileName.toLowerCase()

  if (fileName.startsWith("license")) {
    return <Icon icon="GrCertificate" />
  }

  switch (extname(fileName)) {
    case ".map":
      return <Icon icon="FaMap" />
    case ".js":
    case ".mjs":
      return <Icon icon="SiJavascript" />
    case ".ts":
    case ".tsx":
      return <Icon icon="SiTypescript" />
    case ".md":
      return <Icon icon="SiMarkdown" />
    case ".scss":
    case ".sass":
      return <Icon icon="SiSass" />
    case ".css":
      return <Icon icon="SiCss3" />
    case ".json":
      return <Icon icon="SiJson" />
    case ".html":
      return <Icon icon="SiHtml5" />
    case ".node":
      return <Icon icon="BsFillFileBinaryFill" />
    default:
      return <Document />
  }
}
