import { FormGroup } from "@blueprintjs/core"
import { memo } from "react"

import { T } from "~/Locale"

function Link({
  icon,
  href,
  children,
}: {
  icon: string
  children: string
  href: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      css="flex items-center gap-1 font-narrow tracking-tight"
    >
      <img src={icon} css="size-4" alt={children} />
      {children}
    </a>
  )
}

export const LinksView = memo(({ package: name }: { package: string }) => (
  <FormGroup label={<T en="Links" fr="Liens" ja="リンク" zh-Hant="連結" />}>
    <div css="flex items-center gap-2">
      <Link
        href={`https://bundlephobia.com/package/${name}`}
        icon="/assets/bundlephobia.ico"
      >
        Bundlephobia
      </Link>
      <Link
        href={`https://npmgraph.js.org/?q=${encodeURIComponent(name)}`}
        icon="/assets/npmgraph.svg"
      >
        npmgraph
      </Link>
    </div>
  </FormGroup>
))
