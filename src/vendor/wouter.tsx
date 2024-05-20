// https://github.com/molefrog/wouter/commit/e106a9dd27cde242b139e27fa8ac2fdb218fc523
// node_modules/.pnpm/wouter@3.1.3_react@19.0.0-beta-26f2496093-20240514/node_modules/wouter/esm/index.js
import { parse } from "regexparam"

// node_modules/.pnpm/wouter@3.1.3_react@19.0.0-beta-26f2496093-20240514/node_modules/wouter/esm/react-deps.js
import * as React from "react"
import {
  Fragment,
  cloneElement,
  createContext,
  createElement,
  forwardRef,
  isValidElement,
  useContext,
  useRef,
  useSyncExternalStore,
} from "react"
const { useEffect, useLayoutEffect, useRef: useRef2 } = React
const useBuiltinInsertionEffect = React.useInsertionEffect
const canUseDOM = !!(
  typeof window !== "undefined" &&
  window.document !== undefined &&
  window.document.createElement !== undefined
)
const useIsomorphicLayoutEffect = canUseDOM ? useLayoutEffect : useEffect
const useInsertionEffect2 =
  useBuiltinInsertionEffect || useIsomorphicLayoutEffect
const useEvent = (fn) => {
  const ref = useRef2([fn, (...args) => ref[0](...args)]).current
  useInsertionEffect2(() => {
    ref[0] = fn
  })
  return ref[1]
}

// node_modules/.pnpm/wouter@3.1.3_react@19.0.0-beta-26f2496093-20240514/node_modules/wouter/esm/use-browser-location.js
const eventPopstate = "popstate"
const eventPushState = "pushState"
const eventReplaceState = "replaceState"
const eventHashchange = "hashchange"
const events = [
  eventPopstate,
  eventPushState,
  eventReplaceState,
  eventHashchange,
]
const subscribeToLocationUpdates = (callback) => {
  for (const event of events) {
    addEventListener(event, callback)
  }
  return () => {
    for (const event of events) {
      removeEventListener(event, callback)
    }
  }
}
const useLocationProperty = (fn, ssrFn) =>
  useSyncExternalStore(subscribeToLocationUpdates, fn, ssrFn)
const currentSearch = () => location.search
const useSearch = ({ ssrSearch = "" } = {}) =>
  useLocationProperty(currentSearch, () => ssrSearch)
const currentPathname = () => location.pathname
const usePathname = ({ ssrPath } = {}) =>
  useLocationProperty(
    currentPathname,
    ssrPath ? () => ssrPath : currentPathname,
  )
const navigate = (to, { replace = false, state = null } = {}) =>
  history[replace ? eventReplaceState : eventPushState](state, "", to)
const useBrowserLocation = (opts = {}) => [usePathname(opts), navigate]
const patchKey = Symbol.for("wouter_v3")
if (typeof history !== "undefined" && window[patchKey] === undefined) {
  for (const type of [eventPushState, eventReplaceState]) {
    const original = history[type]
    history[type] = function () {
      const result = original.apply(this, arguments)
      const event = new Event(type)
      event.arguments = arguments
      dispatchEvent(event)
      return result
    }
  }
  Object.defineProperty(window, patchKey, { value: true })
}

// node_modules/.pnpm/wouter@3.1.3_react@19.0.0-beta-26f2496093-20240514/node_modules/wouter/esm/index.js
const relativePath = (base = "", path) =>
  !path.toLowerCase().indexOf(base.toLowerCase())
    ? path.slice(base.length) || "/"
    : "~" + path
const absolutePath = (to, base = "") =>
  to[0] === "~" ? to.slice(1) : base + to
const stripQm = (str) => (str[0] === "?" ? str.slice(1) : str)
const unescape = (str) => {
  try {
    return decodeURI(str)
  } catch (_e) {
    return str
  }
}
const defaultRouter = {
  hook: useBrowserLocation,
  searchHook: useSearch,
  parser: parse,
  base: "",
  // this option is used to override the current location during SSR
  ssrPath: void 0,
  ssrSearch: void 0,
  // customizes how `href` props are transformed for <Link />
  hrefs: (x) => x,
}
const RouterCtx = createContext(defaultRouter)
const useRouter = () => useContext(RouterCtx)
const ParamsCtx = createContext({})
const useParams = () => useContext(ParamsCtx)
const useLocationFromRouter = (router) => {
  const [location2, navigate2] = router.hook(router)
  return [
    unescape(relativePath(router.base, location2)),
    useEvent((to, navOpts) =>
      navigate2(absolutePath(to, router.base), navOpts),
    ),
  ]
}
const useLocation = () => useLocationFromRouter(useRouter())
const useSearch2 = () => {
  const router = useRouter()
  return unescape(stripQm(router.searchHook(router)))
}
const matchRoute = (parser, route, path, loose) => {
  const { pattern, keys } = parser(route || "*", loose)
  const [$base, ...matches] = pattern.exec(path) || []
  return $base !== void 0
    ? [
        true,
        // an object with parameters matched, e.g. { foo: "bar" } for "/:foo"
        // we "zip" two arrays here to construct the object
        // ["foo"], ["bar"] → { foo: "bar" }
        Object.fromEntries(keys.map((key, i) => [key, matches[i]])),
        // the third value if only present when parser is in "loose" mode,
        // so that we can extract the base path for nested routes
        ...(loose ? [$base] : []),
      ]
    : [false, null]
}
const useRoute = (pattern) =>
  matchRoute(useRouter().parser, pattern, useLocation()[0])
const Router = ({ children, ...props }) => {
  const parent_ = useRouter()
  const parent = props.hook ? defaultRouter : parent_
  let value = parent
  const [path, search] = props.ssrPath?.split("?") ?? []
  if (search) (props.ssrSearch = search), (props.ssrPath = path)
  props.hrefs = props.hrefs ?? props.hook?.hrefs
  const ref = useRef({})
  const prev = ref.current
  let next = prev
  for (const k in parent) {
    const option =
      k === "base"
        ? /* base is special case, it is appended to the parent's base */
          parent[k] + (props[k] || "")
        : props[k] || parent[k]
    if (prev === next && option !== next[k]) {
      ref.current = next = { ...next }
    }
    next[k] = option
    if (option !== parent[k]) value = next
  }
  return createElement(RouterCtx.Provider, { value, children })
}
const h_route = ({ children, component }, params) => {
  if (component) return createElement(component, { params })
  return typeof children === "function" ? children(params) : children
}
const Route = ({ path, nest, match, ...renderProps }) => {
  const router = useRouter()
  const [location2] = useLocationFromRouter(router)
  const [matches, params, base] =
    // `match` is a special prop to give up control to the parent,
    // it is used by the `Switch` to avoid double matching
    match ?? matchRoute(router.parser, path, location2, nest)
  if (!matches) return null
  const children = base
    ? createElement(Router, { base }, h_route(renderProps, params))
    : h_route(renderProps, params)
  return createElement(ParamsCtx.Provider, { value: params, children })
}
const Link = forwardRef((props, ref) => {
  const router = useRouter()
  const [currentPath, navigate2] = useLocationFromRouter(router)
  const {
    to,
    href: targetPath = to,
    onClick: _onClick,
    asChild,
    children,
    className: cls,
    replace,
    state,
    ...restProps
  } = props
  const onClick = useEvent((event) => {
    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.shiftKey ||
      event.button !== 0
    )
      return
    _onClick?.(event)
    if (!event.defaultPrevented) {
      event.preventDefault()
      navigate2(targetPath, props)
    }
  })
  const href = router.hrefs(
    targetPath[0] === "~" ? targetPath.slice(1) : router.base + targetPath,
    router,
    // pass router as a second argument for convinience
  )
  return asChild && isValidElement(children)
    ? cloneElement(children, { onClick, href })
    : createElement("a", {
        ...restProps,
        onClick,
        href,
        // `className` can be a function to apply the class if this link is active
        className: cls?.call ? cls(currentPath === targetPath) : cls,
        children,
        ref,
      })
})
const flattenChildren = (children) =>
  Array.isArray(children)
    ? children.flatMap((c) =>
        flattenChildren(c && c.type === Fragment ? c.props.children : c),
      )
    : [children]
const Switch = ({ children, location: location2 }) => {
  const router = useRouter()
  const [originalLocation] = useLocationFromRouter(router)
  for (const element of flattenChildren(children)) {
    let match = 0
    if (
      isValidElement(element) && // we don't require an element to be of type Route,
      // but we do require it to contain a truthy `path` prop.
      // this allows to use different components that wrap Route
      // inside of a switch, for example <AnimatedRoute />.
      (match = matchRoute(
        router.parser,
        element.props.path,
        location2 || originalLocation,
        element.props.nest,
      ))[0]
    )
      return cloneElement(element, { match })
  }
  return null
}
const Redirect = (props) => {
  const { to, href = to } = props
  const [, navigate2] = useLocation()
  const redirect = useEvent(() => navigate2(to || href, props))
  useIsomorphicLayoutEffect(() => {
    redirect()
  }, [])
  return null
}
export {
  Link,
  Redirect,
  Route,
  Router,
  Switch,
  useLocation,
  useParams,
  useRoute,
  useRouter,
  useSearch2 as useSearch,
}
