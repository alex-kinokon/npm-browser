import { lazy } from "react"
import type { RouteParams } from "regexparam"
import { Route, Switch } from "~/vendor/wouter"

const PackagePage = lazy(() => import("./pages/package/package"))
const UserPage = lazy(() => import("./pages/user/index.page"))

export default (
  <Switch>
    {route(
      "/",
      lazy(() => import("./pages/index.page")),
    )}
    {route(
      "/search",
      lazy(() => import("./pages/search.page")),
    )}
    {route(
      "/third-party-notices",
      lazy(() => import("./pages/third-party-notices.page")),
    )}
    {route("/user/:user", ({ user }) => (
      <UserPage name={user} />
    ))}
    {route("/package/:name", ({ name }) => (
      <PackagePage name={name} />
    ))}
    {route2(
      "/package/:scope/:name",
      ({ scope }) => scope.startsWith("@"),
      ({ scope, name }) => (
        <PackagePage name={`${scope}/${name}`} />
      ),
    )}
    {route("/package/:name/v/:version", ({ name, version }) => (
      <PackagePage name={name} version={version} />
    ))}
    {route2(
      "/package/:scope/:name/v/:version",
      ({ scope }) => scope.startsWith("@"),
      ({ name, version, scope }) => (
        <PackagePage name={`${scope}/${name}`} version={version} />
      ),
    )}
    <Route key={404} component={lazy(() => import("./pages/404.page"))} />
  </Switch>
)

function route<RoutePath extends string>(
  path: RoutePath,
  Component: React.ComponentType<RouteParams<RoutePath>>,
): JSX.Element {
  return (
    <Route
      path={path}
      component={({ params }) => <Component {...(params as any)} />}
    />
  )
}

function route2<RoutePath extends string>(
  path: RoutePath,
  predicate: (params: RouteParams<RoutePath>, location: string) => boolean,
  Component: (props: RouteParams<RoutePath>) => JSX.Element,
): JSX.Element {
  return (
    <Route
      path={path}
      predicate={predicate}
      component={({ params }) => <Component {...(params as any)} />}
    />
  )
}
