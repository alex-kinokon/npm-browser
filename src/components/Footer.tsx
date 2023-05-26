import { Classes } from "@blueprintjs/core"
import { SiGithub } from "react-icons/si"
import { css, cx } from "@emotion/css"
import Link from "next/link"

export default function Footer() {
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
        © 2023. This website is not affiliated with npm or Microsoft.
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
