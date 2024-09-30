import { css } from "@emotion/css"

import { useT } from "~/Locale"
import type {
  Packument,
  RawPackageManifest,
} from "~/vendor/node-query-registry"

import { type PackageIdentifier } from "./package"

function isESM({ type, module, exports }: RawPackageManifest) {
  return (
    type === "module" ||
    module != null ||
    (exports &&
      typeof exports === "object" &&
      !Array.isArray(exports) &&
      Object.values(exports).some(
        (obj) => obj && "import" in (obj as object),
      )) ||
    false
  )
}

export function ESMStatus({
  data,
  package: { version },
}: {
  data: Packument
  package: PackageIdentifier
}) {
  const pkg = data.versions[version]
  const esm = isESM(pkg)

  const t = useT()

  if (esm) {
    return (
      <div
        title={t({
          en: "This package is an ECMAScript module.",
          fr: "Ce paquet est un module ECMAScript.",
          "zh-Hant": "此套件是 ECMAScript 模組。",
          ja: "このパッケージは ECMAScript モジュールです。",
        })}
        css="ml-[10px] cursor-pointer rounded border border-solid border-emerald-700 px-1 font-semibold text-emerald-700 hover:underline"
        className={css`
          font-family:
            "Segoe UI",
            -apple-system,
            BlinkMacSystemFont,
            Roboto;
          font-size: 0.8em;
          padding: 1px;
        `}
      >
        ESM
      </div>
    )
  }

  return null
}
