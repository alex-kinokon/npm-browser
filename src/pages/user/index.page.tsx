import { useQuery } from "@tanstack/react-query"
import { Classes, Divider, H3, H4 } from "@blueprintjs/core"
import styled from "@emotion/styled"
import { cx } from "@emotion/css"
import { Link } from "wouter"
import { getUserInfo } from "~/remote"
import { PageHeader } from "~/components/Header"
import Footer from "~/components/Footer"
import { Container } from "~/components/Container"
import { PageError } from "~/components/PageError"
import type { Packument } from "~/vendor/node-query-registry"
import type { NpmUser } from "~/remote/npmUser"
import { T } from "~/Locale"
import { RelativeTime } from "~/utils/relativeTime"
import { PublicationTime } from "../package/Header"

export interface PackageIdentifier {
  name: string
  version: string
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-template-columns: minmax(0, 1fr) 300px;
  grid-gap: 30px;
  margin-left: -4px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    margin-left: 0;
    > div {
      max-width: 100%;
      overflow: scroll;
    }
  }
`

function UserPageHeader({
  name,
  data,
  isLoading,
}: {
  name: string
  data?: NpmUser
  isLoading: boolean
}) {
  const scope = data?.scope

  const isOrg = scope?.type === "org"
  const created = scope?.created
  const fullName = isOrg ? undefined : scope?.resource.fullname

  const skeleton = cx(isLoading && Classes.SKELETON)

  return (
    <div>
      <div css="mb-4 flex items-center gap-3">
        {!isOrg && scope != null && (
          <img
            className={skeleton}
            src={`https://www.npmjs.com${scope?.parent.avatars.small}`}
            height={40}
            width={40}
            alt={name}
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            css="rounded-full"
          />
        )}
        {fullName != null ? (
          <div css="flex flex-col">
            <H4 className={skeleton} css="mb-1">
              {fullName}
            </H4>
            <span>@{name}</span>
          </div>
        ) : (
          <div css="flex flex-row">
            <H3 css="mb-1">@{name}</H3>
          </div>
        )}
      </div>

      <div>
        <div className={skeleton}>
          <T en="Created" fr="Créé" ja="作成日" zh-Hant="創建日期" />{" "}
          {created != null && <RelativeTime date={new Date(created)} />}
        </div>
      </div>
    </div>
  )
}

function UserPageGrid({
  name,
  data,
  isLoading,
}: {
  name: string
  data?: NpmUser
  isLoading: boolean
}) {
  const skeleton = cx(isLoading && Classes.SKELETON)

  return (
    <Grid>
      <div>
        <UserPageHeader name={name} data={data} isLoading={isLoading} />
        <Divider css="-ml-0.5" />

        <div className={skeleton}>
          {data?.packages.objects.map((pkg) => (
            <div key={pkg.name} css="mt-4">
              <H4>
                <Link href={`/package/${pkg.name}`}>{pkg.name}</Link>
              </H4>
              <p>{pkg.description}</p>

              <div css="flex items-center gap-2">
                <div>{pkg.version}</div>
                <PublicationTime
                  isLoading={isLoading}
                  time={pkg.lastPublish.time}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Grid>
  )
}

export default function UserPage({ name }: { name: string }) {
  const { data, isLoading, error, isError } = useQuery(getUserInfo(name))

  return (
    <div css={isLoading ? "cursor-wait" : undefined}>
      <PageHeader />
      <title>{name}</title>
      <Container>
        {isError ? (
          <PageError error={error as Error} />
        ) : (
          <UserPageGrid name={name} data={data} isLoading={isLoading} />
        )}

        <Divider css="-ml-0.5 mt-[40px]" />
        <Footer />
      </Container>
    </div>
  )
}

export function getCurrentVersion(data?: Packument, version?: string) {
  return data && version ? data?.versions[version] : undefined
}
