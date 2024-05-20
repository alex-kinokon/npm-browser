import { Classes } from "@blueprintjs/core"
import Icon from "@aet/icons/macro"
import { css } from "@emotion/css"
import { Link } from "~/vendor/wouter"
import { T, useT } from "~/Locale"

export default function Footer() {
  const t = useT()
  return (
    <footer css="mb-10 mt-5 flex items-center" className={Classes.RUNNING_TEXT}>
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
          css="flex items-center"
          className={css`
            &:not(:hover) {
              color: #24292f;
              .bp5-dark & {
                color: #f6f7f9;
              }
            }
          `}
        >
          <Icon icon="SiGithub" css="mr-1" />
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
