/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button, Intent } from "@blueprintjs/core"
import { css } from "@emotion/css"
import styled from "@emotion/styled"
import { useQuery } from "@tanstack/react-query"
import { memo } from "react"
import { useT } from "~/contexts/Locale"
import { getPackageFile } from "~/remote"
import { toaster } from "~/utils/toast"

export const PathNavigation = memo<{
  package: string
  path: string
  setPath: (path: string) => void
  file?: { hex: string }
}>(({ package: name, path, setPath, file }) => {
  const t = useT()
  const { data } = useQuery(getPackageFile(name, file?.hex))

  const pathSegments: React.ReactNode[] = path
    .split("/")
    .slice(1)
    .map((segment, index, array) => (
      <span key={index}>
        {index === array.length - 1 ? (
          <span>{segment}</span>
        ) : (
          <>
            <a
              href="#"
              onClick={event => {
                event.preventDefault()
                setPath(path.slice(0, path.indexOf(segment) + segment.length))
              }}
            >
              {segment}
            </a>
            {" / "}
          </>
        )}
      </span>
    ))

  pathSegments.unshift(
    <a
      key="/"
      href="#"
      onClick={event => {
        event.preventDefault()
        setPath("/")
      }}
    >
      {name}
    </a>,
    " / "
  )

  return (
    <Header
      className={css`
        display: flex;
      `}
    >
      <div
        className={css`
          flex: 1;
        `}
      >
        {pathSegments}
      </div>
      {file != null && (
        <Button
          small
          icon="duplicate"
          minimal
          onClick={async () => {
            if (!data) return

            try {
              await navigator.clipboard.writeText(data)
              toaster.show({
                message: t({
                  en: "Copied to clipboard",
                  fr: "Copié dans le presse-papier",
                  ja: "クリップボードにコピーしました",
                  "zh-Hant": "已複製到剪貼簿",
                }),
                intent: Intent.SUCCESS,
              })
            } catch (e) {
              toaster.show({
                message: "Failed to copy to clipboard: " + (e.message ?? "Unknown error"),
                intent: Intent.DANGER,
              })
            }
          }}
        />
      )}
    </Header>
  )
})

const Header = styled.header`
  margin-bottom: 10px;
`
