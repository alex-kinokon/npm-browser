import { FormGroup, Switch } from "@blueprintjs/core"
import { css } from "@emotion/css"
import styled from "@emotion/styled"
import { memo, useMemo, useState } from "react"

import { Markdown, markdownStyle } from "~/components/Markdown"
import { T, useT } from "~/Locale"

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
  const [dev, setDev] = useState(false)
  const t = useT()

  const installInstruction = useMemo(() => {
    switch (pkgMan) {
      case "npm":
        return dev ? `npm install --save-dev ${name}` : `npm install ${name}`
      case "yarn":
        return dev ? `yarn add --dev ${name}` : `yarn add ${name}`
      case "pnpm":
        return dev ? `pnpm add --save-dev ${name}` : `pnpm add ${name}`
    }
  }, [name, pkgMan, dev])

  return (
    <FormGroup
      label={
        <div css="flex items-center">
          <div className={css({ flex: 1 })}>
            <T en="Install" fr="Installer" ja="インストール" zh-Hant="安裝" />
          </div>
          <div css="flex items-center">
            <Switch
              checked={dev}
              onChange={() => setDev(!dev)}
              innerLabelChecked="dev"
              css="mb-0 [transform:translate(0,-3px)]"
              aria-label={t({
                en: "Install as a development dependency",
                fr: "Installer en tant que dépendance de développement",
                ja: "開発依存関係としてインストール",
                "zh-Hant": "安裝為開發依賴",
              })}
              className={css`
                .bp5-switch-inner-text {
                  margin-left: -4px;
                  margin-right: -4px;
                }
              `}
            />
            <div>
              {pkgMan !== "npm" && (
                <PkgSwitcher onClick={() => setPkgMan("npm")}>NPM</PkgSwitcher>
              )}
              {pkgMan !== "yarn" && (
                <PkgSwitcher onClick={() => setPkgMan("yarn")}>
                  Yarn
                </PkgSwitcher>
              )}
              {pkgMan !== "pnpm" && (
                <PkgSwitcher onClick={() => setPkgMan("pnpm")}>
                  PNPM
                </PkgSwitcher>
              )}
            </div>
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
