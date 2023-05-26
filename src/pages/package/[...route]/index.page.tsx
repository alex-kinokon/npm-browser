import type { ParsedUrlQuery } from "querystring"
import invariant from "tiny-invariant"
import type { DehydratedState } from "@tanstack/react-query"
import { QueryClient, dehydrate } from "@tanstack/react-query"
import type { GetServerSideProps, InferGetServerSidePropsType } from "next"
import dynamic from "next/dynamic"
import {
  getPackageFile,
  getPackageFiles,
  getReadmeFileHex,
  getRegistryPackageInfo,
} from "~/remote"

const PackagePage = dynamic(() => import("./package"), {
  ssr: false,
})

// four possibilities:
// 1. pkgName
// 2. @scope/pkgName
// 3. pkgName/v/version
// 4. @scope/pkgName/v/version
function parseRoute(routes: string[]) {
  switch (routes.length) {
    case 4:
      invariant(routes[1] === "v", "invalid route")
      return { name: routes.slice(0, 2).join("/"), version: routes[3] }
    case 3:
      invariant(routes[1] === "v", "invalid route")
      return { name: routes[0], version: routes[2] }
    case 2:
      return { name: routes.join("/"), version: undefined }
    case 1:
      return { name: routes[0], version: undefined }
    default:
      throw new Error("invalid route")
  }
}

async function getServerSide(params?: ParsedUrlQuery) {
  const { name, version } = parseRoute(params!.route as string[])

  let dehydratedState: DehydratedState | undefined = undefined
  if (process.env.DEPLOYMENT !== "vercel") {
    const client = new QueryClient()
    const pkgInfo = await client.fetchQuery(getRegistryPackageInfo(name))

    const pkgFileOptions = await client.fetchQuery(
      getPackageFiles(name, version ?? pkgInfo["dist-tags"].latest)
    )
    const readmeHex = getReadmeFileHex(pkgFileOptions)
    if (readmeHex) {
      await client.prefetchQuery(getPackageFile(name, readmeHex))
    }

    dehydratedState = dehydrate(client)

    if (process.env.NODE_ENV === "development") {
      // https://github.com/vercel/next.js/discussions/11209
      dehydratedState = JSON.parse(JSON.stringify(dehydratedState))
    }
  }

  return {
    route: { name, version: version || null },
    dehydratedState,
  }
}

export const getServerSideProps: GetServerSideProps<
  Awaited<ReturnType<typeof getServerSide>>
> = async ({ params }) => ({
  props: await getServerSide(params),
})

export default function Package({
  route,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <PackagePage name={route.name} version={route.version || undefined} />
}
