import { css } from "@emotion/css"
import { tags } from "@lezer/highlight"
import { javascript } from "@codemirror/lang-javascript"
import { useMemo, useState } from "react"
import ReactCodeMirror from "@uiw/react-codemirror"
import type { Extension } from "@codemirror/state"
import { Button, Intent } from "@blueprintjs/core"
import { githubDarkInit, githubLightInit } from "@uiw/codemirror-theme-github"
import type { PackageIdentifier } from "../package"
import { useDarkMode } from "~/hooks/useDarkMode"
import { T } from "~/Locale"

function useCodeMirrorTheme() {
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
    [dark],
  )
}

export function Playground({
  package: { name, version },
}: {
  package: PackageIdentifier
}) {
  const theme = useCodeMirrorTheme()
  const [code, setCode] = useState(
    `import * as mod from "https://esm.sh/${name}${
      version ? `@${version}` : ""
    }";\nconsole.log(mod);`,
  )

  const extensions: Extension[] = useMemo(
    () => [javascript({ typescript: true, jsx: true })],
    [],
  )

  return (
    <div
      className={css`
        .cm-focused {
          outline: none !important;
        }
        .cm-gutters {
          border-right: none;
        }
      `}
    >
      <div css="mb-5">
        <div css="mb-2.5">
          <Button
            intent={Intent.PRIMARY}
            onClick={() => {
              try {
                import(
                  /* @vite-ignore */ `data:text/javascript;charset=utf-8,${encodeURIComponent(
                    code,
                  )}`
                )
              } catch (e) {
                console.error(e)
              }
            }}
          >
            <T en="Run" fr="Exécuter" />
          </Button>
        </div>
        <ReactCodeMirror
          theme={theme}
          extensions={extensions}
          value={code}
          onChange={setCode}
        />
      </div>

      <div
        className={css`
          max-height: 300px;
          overflow-y: auto;
        `}
      ></div>
    </div>
  )
}
