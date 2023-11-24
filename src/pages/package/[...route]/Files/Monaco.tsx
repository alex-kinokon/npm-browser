import * as monaco from "monaco-editor"
import { loader } from "@monaco-editor/react"
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker"
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker"
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker"
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker"
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker"

import githubDark from "./themes/github-dark.json"
import githubLight from "./themes/github-light.json"

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") {
      return new jsonWorker()
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker()
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker()
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker()
    }
    return new editorWorker()
  },
}

loader.config({ monaco })

if (process.env.NODE_ENV === "development") {
  Object.assign(window, { monaco })
}

monaco.editor.defineTheme("github-dark", githubDark as monaco.editor.IStandaloneThemeData)
monaco.editor.defineTheme(
  "github-light",
  githubLight as monaco.editor.IStandaloneThemeData
)
