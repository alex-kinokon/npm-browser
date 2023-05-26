import { css } from "@emotion/css"
import { Classes, FormGroup } from "@blueprintjs/core"
import Link from "next/link"
import Image from "next/image"
import { memo } from "react"
import type { NpmPackage } from "~/remote/npmPackage"
import { T } from "~/contexts/Locale"

export const MaintainersView = memo(({ npm }: { npm?: NpmPackage }) => (
  <FormGroup
    label={<T en="Maintainers" fr="Mainteneurs" ja="メンテナー" zh-Hant="維護者" />}
  >
    <ul className={Classes.LIST_UNSTYLED}>
      {npm?.packument.maintainers.map(maintainer => (
        <li
          key={maintainer.name}
          className={css`
            margin-bottom: 5px;
          `}
        >
          <Link
            href={`/~${maintainer.name}`}
            title={maintainer.name}
            className={css`
              display: flex;
              align-items: center;
            `}
          >
            <Image
              src={`https://www.npmjs.com${maintainer.avatars.small}`}
              height={20}
              width={20}
              alt={maintainer.name}
              className={css`
                border-radius: 5px;
                margin-right: 6px;
              `}
            />
            <span>{maintainer.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  </FormGroup>
))
