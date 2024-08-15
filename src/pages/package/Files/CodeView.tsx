import "./Monaco"

import { css, cx } from "@emotion/css"
import { Editor } from "@monaco-editor/react"
import { useQuery } from "@tanstack/react-query"
// import { useLocation } from "~/vendor/wouter"
import type * as monaco from "monaco-editor"
import { memo, useMemo, useRef } from "react"

import { Markdown, markdownStyle } from "~/components/Markdown"
import { useDarkMode } from "~/hooks/useDarkMode"
import { getPackageFile } from "~/remote"

import { ErrorView, LoadingView } from "../NonIdeal"
import type { PackageIdentifier } from "../package"

import { intellisense } from "./fetchType"
import type { ICodeEditorService } from "./monaco-def/codeEditorService"

import type { MappedFile } from "./index"

interface CodeViewProps {
  className?: string
  file: MappedFile
  files: MappedFile[]
  setPath: (path: string) => void
  package: PackageIdentifier
}

const CodeViewInternal = memo<
  CodeViewProps & {
    className?: string
    data: string
  }
>(({ className, file, files, setPath, data, package: pkg }) => {
  // const [, setLocation] = useLocation()
  const dark = useDarkMode()

  const ref = useRef<HTMLDivElement>(null)

  const cjkFont = file.path.includes("ja")
    ? "Noto Sans CJK JP"
    : "Noto Sans CJK SC"

  const options = useMemo(
    (): monaco.editor.IStandaloneEditorConstructionOptions => ({
      fontFamily: `ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, ${cjkFont}, monospace`,
      fontSize: 14,
      readOnly: true,
      minimap: {
        enabled: false,
      },
      wordWrap: "on",
    }),
    [cjkFont],
  )

  return (
    <div className={className} ref={ref}>
      <Editor
        value={data}
        theme={dark ? "github-dark" : "github-light"}
        path={file.path}
        onChange={() => {}}
        className={css`
          height: 100%;
          min-height: calc(100vh - 110px);
          .monaco-scrollable-element > .scrollbar > .slider {
            border-radius: 10px;
          }
        `}
        options={options}
        onMount={(editor) => {
          intellisense(editor, pkg, files, file)
          const editorService = (editor as any)
            ._codeEditorService as StandaloneCodeEditorService
          const openEditorBase =
            editorService.openCodeEditor.bind(editorService)
          editorService.openCodeEditor = (input, source) => {
            setPath(input.resource.path)
            return openEditorBase(input, source)
          }
        }}
      />
    </div>
  )
})

export function CodeView(props: CodeViewProps) {
  const { package: pkg, file, className } = props
  const { data, isLoading, isError, error, refetch } = useQuery(
    getPackageFile(pkg.name, file.hex),
  )

  if (isError) {
    return <ErrorView error={error} isLoading={isLoading} retry={refetch} />
  } else if (isLoading) {
    return <LoadingView />
  } else if (!data) {
    return null
  }

  return file.basename.endsWith(".md") ? (
    <Markdown className={cx(markdownStyle, className)} source={data} />
  ) : (
    <CodeViewInternal {...props} data={data} />
  )
}

interface StandaloneCodeEditorService extends ICodeEditorService {
  setActiveCodeEditor(activeCodeEditor: monaco.editor.ICodeEditor | null): void
}
