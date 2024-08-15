import { NonIdealState } from "@blueprintjs/core"
import { Error } from "@blueprintjs/icons"

import { T } from "~/Locale"

export function PageError({ error }: { error: Error }) {
  return (
    <div css="my-[70px]">
      <NonIdealState
        icon={<Error size={48} />}
        title={<T en="Error" fr="Erreur" ja="エラー" zh-Hant="錯誤" />}
        description={error.message ?? "Unknown error"}
      />
    </div>
  )
}
