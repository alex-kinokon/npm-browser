import { css, cx } from "@emotion/css"
import { Classes, FormGroup } from "@blueprintjs/core"
import { useQuery } from "@tanstack/react-query"
import { memo } from "react"
import { getPackageDownloads } from "~/vendor/node-query-registry"
import { T } from "~/contexts/Locale"

export const DownloadsView = memo(({ package: name }: { package: string }) => {
  const { data: downloads } = useQuery({
    queryKey: ["getPackageDownloads", name, "last-week"],
    queryFn: () => getPackageDownloads({ name, period: "last-week" }),
  })

  return (
    <FormGroup
      label={
        <T
          en="Weekly Downloads"
          fr="Téléchargements hebdomadaires"
          ja="週間ダウンロード数"
          zh-Hant="每週下載次數"
        />
      }
    >
      <span
        className={cx(
          !downloads && Classes.SKELETON,
          css`
            font-variant-numeric: tabular-nums;
          `
        )}
      >
        {downloads?.downloads.toLocaleString()}
      </span>
    </FormGroup>
  )
})
