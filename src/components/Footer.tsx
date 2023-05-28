import { Classes } from "@blueprintjs/core"
import { SiGithub } from "react-icons/si"
import { css, cx } from "@emotion/css"
import { Link } from "wouter"
import { T, useT } from "~/contexts/Locale"

export default function Footer() {
  const t = useT()
  return (
    <footer
      className={cx(
        Classes.RUNNING_TEXT,
        css`
          display: flex;
          align-items: center;
          margin-top: 20px;
          margin-bottom: 40px;
        `
      )}
    >
      <div
        className={css`
          flex: 1%;
        `}
      >
        © 2023.{" "}
        <T
          en="This website is not affiliated with npm or Microsoft."
          fr="Ce site web n’est pas affilié à npm ou Microsoft."
          ja="このウェブサイトはnpmまたはMicrosoftと関係ありません。"
          zh-Hant="本網站與npm或Microsoft無關。"
        />{" "}
        <Link href="/third-party-notices">{t(thirdPartyNoticeLabel)}</Link> •{" "}
        <T en="Beta preview" fr="Version bêta" ja="ベータ版" zh-Hant="測試版" />
      </div>
      <div>
        <Link
          href="https://github.com"
          target="_blank"
          className={css`
            display: flex;
            align-items: center;
            &:not(:hover) {
              color: #24292f;
              .bp5-dark & {
                color: #f6f7f9;
              }
            }
          `}
        >
          <SiGithub
            className={css`
              margin-right: 5px;
            `}
          />
          GitHub
        </Link>
      </div>
    </footer>
  )
}

export const thirdPartyNoticeLabel = {
  en: "Third-party notices",
  fr: "Avis relatifs aux logiciels tiers",
} as const
