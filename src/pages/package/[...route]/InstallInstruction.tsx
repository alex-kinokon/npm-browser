import { css } from "@emotion/css"
import { FormGroup } from "@blueprintjs/core"
import styled from "@emotion/styled"
import { memo, useMemo, useState } from "react"
import { Markdown, markdownStyle } from "~/components/Markdown"
import { T } from "~/contexts/Locale"

type PkgMan = "npm" | "yarn" | "pnpm"

const PkgSwitcher = styled.a`
  font-weight: normal;
  &:not(:last-child) {
    margin-right: 4px;
    &:after {
      content: "|";
      margin-left: 4px;
      text-decoration: none;
      color: #1c2127;
      @media (prefers-color-scheme: dark) {
        color: #c9d1d9;
      }
    }
  }
`

export const Install = memo(({ name }: { name: string }) => {
  const [pkgMan, setPkgMan] = useState<PkgMan>("npm")
  const installInstruction = useMemo(() => {
    switch (pkgMan) {
      case "npm":
        return `npm install ${name}`
      case "yarn":
        return `yarn add ${name}`
      case "pnpm":
        return `pnpm add ${name}`
    }
  }, [name, pkgMan])

  return (
    <FormGroup
      label={
        <div
          className={css`
            display: flex;
            align-items: center;
          `}
        >
          <div className={css({ flex: 1 })}>
            <T en="Install" fr="Installer" ja="インストール" zh-Hant="安裝" />
          </div>
          <div>
            {pkgMan !== "npm" && (
              <PkgSwitcher onClick={() => setPkgMan("npm")}>NPM</PkgSwitcher>
            )}
            {pkgMan !== "yarn" && (
              <PkgSwitcher onClick={() => setPkgMan("yarn")}>Yarn</PkgSwitcher>
            )}
            {pkgMan !== "pnpm" && (
              <PkgSwitcher onClick={() => setPkgMan("pnpm")}>PNPM</PkgSwitcher>
            )}
          </div>
        </div>
      }
    >
      <Markdown
        className={markdownStyle}
        source={`\`\`\`sh\n${installInstruction}\n\`\`\``}
      />
    </FormGroup>
  )
})
