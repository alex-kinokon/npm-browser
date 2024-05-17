import { lazy } from "react"
import type { RouteComponentProps } from "wouter"
import { Route } from "wouter"

export const data: {
  path: string
  render: () => Promise<{
    default: React.ComponentType<RouteComponentProps<any>>
  }>
}[] = [
  {
    path: "/404",
    render: () => import("./pages/404.page"),
  },
  {
    path: "/",
    render: () => import("./pages/index.page"),
  },
  {
    path: "/search",
    render: () => import("./pages/search.page"),
  },
  {
    path: "/third-party-notices",
    render: () => import("./pages/third-party-notices.page"),
  },
  {
    path: "/package/*",
    render: () => import("./pages/package/index.page"),
  },
]

const routes = data.map(({ path, render }) => (
  <Route key={path} path={path} component={lazy(render)} />
))

routes.push(
  <Route key="404" component={lazy(() => import("./pages/404.page"))} />,
)

export default routes
