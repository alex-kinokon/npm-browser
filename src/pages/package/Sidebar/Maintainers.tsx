import { Classes, FormGroup } from "@blueprintjs/core"
import { memo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "~/vendor/wouter"
import { T } from "~/Locale"
import { getPackageInfo } from "~/remote"

export const MaintainersView = memo(
  ({ package: name }: { package: string }) => {
    const { data: npm } = useQuery(getPackageInfo(name))

    return (
      <FormGroup
        label={
          <T
            en="Maintainers"
            fr="Mainteneurs"
            ja="メンテナー"
            zh-Hant="維護者"
          />
        }
      >
        <ul className={Classes.LIST_UNSTYLED}>
          {npm?.packument?.maintainers.map((maintainer) => (
            <li key={maintainer.name} css="mb-1.5">
              <Link
                href={`/user/${maintainer.name}`}
                title={maintainer.name}
                css="flex items-center"
              >
                <img
                  src={`https://www.npmjs.com${maintainer.avatars.small}`}
                  height={20}
                  width={20}
                  alt={maintainer.name}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  css="mr-1.5 rounded"
                />
                <span>{maintainer.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </FormGroup>
    )
  },
)
