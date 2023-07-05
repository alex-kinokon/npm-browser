import { extname } from "path"
import { useQuery } from "@tanstack/react-query"
import { memo, useEffect, useMemo, useRef } from "react"
import CodeMirror from "@uiw/react-codemirror"
import { githubDarkInit, githubLightInit } from "@uiw/codemirror-theme-github"
import { EditorView } from "@codemirror/view"
import type { Extension } from "@codemirror/state"
import { EditorState } from "@codemirror/state"
import { javascript } from "@codemirror/lang-javascript"
import { json } from "@codemirror/lang-json"
import { indentUnit } from "@codemirror/language"
import { tags } from "@lezer/highlight"
import { css, cx } from "@emotion/css"
import { useLocation } from "wouter"
import { Markdown, markdownStyle } from "~/components/Markdown"
import { ErrorView, LoadingView } from "../NonIdeal"
import { getPackageFile } from "~/remote"
import type { MappedFile } from "./index"
import { useDarkMode } from "~/hooks/useDarkMode"
import { setupLinks } from "./utils"

const basicTheme = EditorView.theme({
  ".cm-scroller": {
    backgroundColor: "var(--color-canvas-subtle)",
    borderRadius: "6px",
    padding: "16px",
  },
  ".cm-content, .cm-scroller": {
    fontFamily: "var(--monospace)",
    fontSize: "13.6px",
    lineHeight: "21px",
  },
  ".cm-gutters": {
    background: "transparent !important",
    borderRight: "none",
  },
})

interface CodeViewProps {
  file: MappedFile
  files: MappedFile[]
  setPath: (path: string) => void
  package: string
}

export function useCodeMirrorTheme() {
  const dark = useDarkMode()
  return useMemo(
    () =>
      dark
        ? githubDarkInit({
            styles: [{ tag: tags.variableName, color: "inherit" }],
          })
        : githubLightInit({
            styles: [{ tag: tags.variableName, color: "inherit" }],
          }),
    [dark]
  )
}

const CodeViewInternal = memo<
  CodeViewProps & {
    data: string
  }
>(({ file, files, setPath, data }) => {
  const [, setLocation] = useLocation()
  const theme = useCodeMirrorTheme()

  const ref = useRef<HTMLDivElement>(null)
  const ext = extname(file.basename)

  const mode: Extension | undefined = useMemo(() => {
    switch (ext) {
      case ".mjs":
      case ".js":
        return javascript()
      case ".jsx":
        return javascript({ jsx: true })
      case ".ts":
        return javascript({ typescript: true })
      case ".tsx":
        return javascript({ typescript: true, jsx: true })
      case ".json":
        return json()
    }
  }, [ext])

  const extensions: Extension[] = useMemo(
    () => [
      mode!,
      basicTheme,
      // indentationMarkers({
      //   hideFirstIndent: true,
      // }),
      EditorView.editable.of(false),
      EditorState.tabSize.of(2),
      indentUnit.of("  "),
    ],
    [mode]
  )

  useEffect(() => {
    setupLinks({
      node: ref.current,
      file,
      files,
      setPath,
      navigate: setLocation,
    })
  }, [file, setPath, files, setLocation])

  if (!mode || data.length < 10000) {
    let mdExt = ext.slice(1)
    if (mdExt === "mjs") {
      mdExt = "js"
    }
    const code = "```" + mdExt + "\n" + data
    return (
      <div ref={ref}>
        <Markdown className={markdownStyle} source={code} />
      </div>
    )
  }

  return (
    <div ref={ref}>
      <CodeMirror
        extensions={extensions}
        value={data.replace(/\n$/g, "")}
        basicSetup={{
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
          lineNumbers: false,
          foldGutter: false,
        }}
        theme={theme}
        readOnly
        className={cx(
          "wmde-markdown-var",
          css`
            max-height: 100vh;
            overflow: scroll;
          `
        )}
      />
    </div>
  )
})

export function CodeView(props: CodeViewProps) {
  const { package: pkg, file } = props
  const { data, isLoading, isError, error, refetch } = useQuery(
    getPackageFile(pkg, file.hex)
  )

  if (isError) {
    return <ErrorView error={error} isLoading={isLoading} retry={refetch} />
  } else if (isLoading) {
    return <LoadingView />
  } else if (!data) {
    return null
  }

  if (file.basename.endsWith(".md")) {
    return <Markdown className={markdownStyle} source={data} />
  } else {
    return <CodeViewInternal {...props} data={data} />
  }
}
