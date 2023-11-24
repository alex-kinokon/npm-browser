import invariant from "tiny-invariant"
import { StrictMode } from "react"
import PackagePage from "./package"
import NotFoundPage from "~/pages/404.page"

// four possibilities:
// 1. pkgName
// 2. @scope/pkgName
// 3. pkgName/v/version
// 4. @scope/pkgName/v/version
export function parseRoute(routes: string[]) {
  switch (routes.length) {
    case 4:
      invariant(routes[2] === "v", "invalid route")
      return { name: routes.slice(0, 2).join("/"), version: routes[3] }
    case 3:
      invariant(routes[1] === "v", "invalid route")
      return { name: routes[0], version: routes[2] }
    case 2:
      return { name: routes.join("/"), version: undefined }
    case 1:
      return { name: routes[0], version: undefined }
    case 0:
      return undefined
  }
}

interface PageParams {
  route: string
}

export default function Package({ params }: { params: PageParams }) {
  const route = parseRoute(params.route.split("/"))
  if (!route) {
    return <NotFoundPage />
  }
  return (
    <StrictMode>
      {" "}
      <PackagePage name={route.name} version={route.version || undefined} />
    </StrictMode>
  )
}
