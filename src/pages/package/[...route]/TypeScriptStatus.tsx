import { css } from "@emotion/css"
import { SiTypescript } from "react-icons/si"
import type { NpmPackage } from "~/remote/npmPackage2"

export function TypeScriptStatus({ npm }: { npm?: NpmPackage }) {
  const t = npm?.capsule.types?.typescript
  if (!t) {
    return null
  }

  if (t.bundled) {
    return (
      <SiTypescript
        fill="#3178C6"
        className={css`
          margin-left: 5px;
          font-size: 1.3em;
        `}
      />
    )
  }

  return (
    <div
      className={css`
        border: 1px solid #3178c6;
        color: #3178c6;
        font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto;
        font-size: 0.8em;
        font-weight: 600;
        margin-left: 5px;
        padding: 1px;
      `}
    >
      <div>DT</div>
    </div>
  )
}
