import { Classes } from "@blueprintjs/core"
import { css, cx } from "@emotion/css"

export default function Footer() {
  return (
    <footer
      className={cx(
        Classes.RUNNING_TEXT,
        css`
          margin-top: 20px;
          margin-bottom: 40px;
        `
      )}
    >
      <div>© 2023. This website is not affiliated with npm or Microsoft.</div>
    </footer>
  )
}
