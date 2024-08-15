// https://github.com/molefrog/wouter/commit/e106a9dd27cde242b139e27fa8ac2fdb218fc523
import {
  Fragment,
  cloneElement,
  createContext,
  createElement,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useInsertionEffect,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react"
import { type RouteParams, parse } from "regexparam"

// the base useLocation hook type. Any custom hook (including the
// default one) should inherit from it.

/**
 * Route patterns and parameters
 */
interface DefaultParams {
  readonly [paramName: string]: string | undefined
}

type Match<T extends DefaultParams = DefaultParams> =
  | [true, T, string?]
  | [false, null, string?]

/*
 * Components: <Route />
 */

interface RouteComponentProps<T extends DefaultParams = DefaultParams> {
  params: T
}

interface RouteProps<
  RoutePath extends string = string,
  Params extends DefaultParams = RouteParams<RoutePath>,
> {
  nest?: boolean
  predicate?: (params: Params, location: string) => boolean
  children?: ((params: Params) => React.ReactNode) | React.ReactNode
  path?: RoutePath
  component?: React.ComponentType<RouteComponentProps<Params>>
}

type NavigationalProps =
  | { to: string; href?: never }
  | { href: string; to?: never }

type Parser = typeof parse

type HrefsFormatter = (href: string, router: RouterObject) => string

interface RouterObject {
  readonly getPath: (router: RouterObject) => string
  readonly navigate: Navigate
  readonly getSearch: () => string
  readonly base: string
  readonly parser: Parser
  readonly ssrPath?: string
  readonly ssrSearch?: string
  readonly hrefs: HrefsFormatter
}

const canUseDOM = !!(
  typeof document !== "undefined" && document.createElement !== undefined
)

const useIsomorphicLayoutEffect = canUseDOM ? useLayoutEffect : useEffect

function useEvent<T extends (...args: any[]) => any>(fn: T) {
  const ref: [T, T] = useRef<[T, T]>([
    fn,
    ((...args) => ref[0](...args)) as T,
  ]).current

  useInsertionEffect(() => {
    ref[0] = fn
  })

  return ref[1]
}

const events = ["popstate", "pushState", "replaceState", "hashchange"] as const

const subscribeToLocationUpdates = (callback: () => void) => {
  for (const event of events) {
    window.addEventListener(event, callback)
  }
  return () => {
    for (const event of events) {
      window.removeEventListener(event, callback)
    }
  }
}

const useSearchHook = ({ ssrSearch = "" } = {}) =>
  useSyncExternalStore(
    subscribeToLocationUpdates,
    () => location.search,
    () => ssrSearch,
  )

const currentPathname = () => location.pathname

const usePathname = ({ ssrPath }: { ssrPath?: string } = {}): string =>
  useSyncExternalStore(
    subscribeToLocationUpdates,
    currentPathname,
    ssrPath ? () => ssrPath : currentPathname,
  )

function navigate(
  to: string,
  { replace = false, state = null }: { replace?: boolean; state?: any } = {},
) {
  history[replace ? "replaceState" : "pushState"](state, "", to)
}

const patchKey = Symbol.for("wouter_v3")

declare global {
  interface Window {
    [patchKey]?: boolean
  }
}

if (typeof history !== "undefined" && window[patchKey] === undefined) {
  for (const type of ["pushState", "replaceState"] as const) {
    const original = history[type]
    history[type] = function (...args) {
      const result = Reflect.apply(original, this, args)
      const event = Object.assign(new Event(type), { arguments: args })
      window.dispatchEvent(event)
      return result
    }
  }
  Object.defineProperty(window, patchKey, { value: true })
}

const relativePath = (base = "", path: string) =>
  !path.toLowerCase().indexOf(base.toLowerCase())
    ? path.slice(base.length) || "/"
    : "~" + path

const absolutePath = (to: string, base = "") =>
  to[0] === "~" ? to.slice(1) : base + to

const stripQm = (str: string) => (str[0] === "?" ? str.slice(1) : str)

function unescape(str: string) {
  try {
    return decodeURI(str)
  } catch {
    return str
  }
}

const defaultRouter: RouterObject = {
  getPath: usePathname,
  getSearch: useSearchHook,
  navigate,
  parser: parse,
  base: "",
  // this option is used to override the current location during SSR
  ssrPath: undefined,
  ssrSearch: undefined,
  // customizes how `href` props are transformed for <Link />
  hrefs: (x) => x,
}

const RouterCtx = createContext<RouterObject>(defaultRouter)
const ParamsCtx = createContext<DefaultParams>({})

export const useRouter = () => useContext(RouterCtx)
export const useParams = () => useContext(ParamsCtx)

function getLocation(router: RouterObject) {
  const location = router.getPath(router)
  return unescape(relativePath(router.base, location))
}

export function useLocation() {
  const router = useRouter()
  return getLocation(router)
}

export function useNavigate() {
  const { base, navigate } = useRouter()
  return useEvent((to: string, navOpts?) =>
    navigate(absolutePath(to, base), navOpts),
  )
}

export function useSearch() {
  const { getSearch } = useRouter()
  return unescape(stripQm(getSearch()))
}

function matchRoute<
  T extends DefaultParams | undefined = undefined,
  RoutePath extends string = string,
  Params extends DefaultParams = T extends DefaultParams
    ? T
    : RouteParams<RoutePath>,
>(
  parser: Parser,
  location: string,
  route: RoutePath,
  predicate?: (params: Params, location: string) => boolean,
  loose?: boolean,
): Match<Params> {
  const { pattern, keys } = parser(route || "*", loose)
  const [$base, ...matches] = pattern.exec(location) || []
  if ($base !== undefined) {
    // an object with parameters matched, e.g. { foo: "bar" } for "/:foo"
    // we "zip" two arrays here to construct the object
    // ["foo"], ["bar"] → { foo: "bar" }
    const params = Object.fromEntries(
      keys.map((key, i) => [key, matches[i]]),
    ) as Params
    if (!predicate || predicate(params, location)) {
      return [
        true,
        params,
        // the third value if only present when parser is in "loose" mode,
        // so that we can extract the base path for nested routes
        loose ? $base : undefined,
      ]
    }
  }

  return [false, null, undefined] as [false, null, (string | undefined)?]
}

export function useRoute<
  T extends DefaultParams | undefined = undefined,
  RoutePath extends string = string,
>(pattern: RoutePath) {
  const router = useRouter()
  return matchRoute<T, RoutePath>(router.parser, getLocation(router), pattern)
}

export function Router({
  children,
  ...props
}: Partial<RouterObject> & {
  children: React.ReactNode
}) {
  const router = useRouter()
  const parent = props.getPath ? defaultRouter : router

  let value = parent
  const [path, search] = props.ssrPath?.split("?") ?? []
  if (search) {
    props.ssrSearch = search
  }
  props.ssrPath = path

  const ref = useRef({})
  const prev = ref.current
  let next: Record<string, any> = prev
  for (const [k, v] of Object.entries(parent)) {
    const option =
      k === "base"
        ? /* base is special case, it is appended to the parent's base */
          v + (props[k] || "")
        : (props as Record<string, any>)[k] || v
    if (prev === next && option !== next[k]) {
      ref.current = next = { ...next }
    }
    next[k] = option
    if (option !== v) {
      value = next as any
    }
  }

  return <RouterCtx.Provider value={value}>{children}</RouterCtx.Provider>
}

function createEl<T>(
  {
    children,
    component,
  }: {
    children?: React.ReactNode | ((params: T) => React.ReactNode)
    component?: React.ComponentType<{ params: T }>
  },
  params: T,
) {
  if (component) {
    return createElement(component, { params })
  } else if (typeof children === "function") {
    return children(params)
  } else {
    return children
  }
}

export function Route<RoutePath extends string = string>({
  path,
  nest,
  match,
  predicate,
  ...renderProps
}: RouteProps<RoutePath> & {
  match?: Match
}): ReturnType<React.FunctionComponent> {
  const router = useRouter()
  const location = getLocation(router)
  const [matches, params, base] =
    // `match` is a special prop to give up control to the parent,
    // it is used by the `Switch` to avoid double matching
    match ?? matchRoute(router.parser, location, path!, predicate, nest)
  if (!matches) return null

  const value = createEl(renderProps, params as RouteParams<RoutePath>)

  return (
    <ParamsCtx.Provider value={params}>
      {base ? <Router base={base}>{value}</Router> : value}
    </ParamsCtx.Provider>
  )
}

type LinkProps = NavigationalProps &
  (
    | {
        asChild: true
        children: React.ReactElement
        onClick?: React.MouseEventHandler
      }
    | ({
        asChild?: false
      } & React.AnchorHTMLAttributes<HTMLAnchorElement> &
        React.RefAttributes<HTMLAnchorElement>)
  )

export const Link = forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  const router = useRouter()
  const navigate = useNavigate()
  const {
    to,
    href: targetPath = to!,
    onClick: _onClick,
    asChild,
    children,
    ...restProps
  } = props

  const onClick = useEvent((event) => {
    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.shiftKey ||
      event.button !== 0
    ) {
      return
    }
    _onClick?.(event)
    if (!event.defaultPrevented) {
      event.preventDefault()
      navigate(targetPath, props)
    }
  })

  const href = router.hrefs(
    targetPath[0] === "~" ? targetPath.slice(1) : router.base + targetPath,
    router,
    // pass router as a second argument for convenience
  )

  return asChild && isValidElement(children) ? (
    cloneElement(children as any, { onClick, href })
  ) : (
    <a {...restProps} onClick={onClick} href={href} ref={ref}>
      {children}
    </a>
  )
})

const flattenChildren = (children: React.ReactNode): React.ReactNode[] =>
  Array.isArray(children)
    ? children.flatMap((c) =>
        flattenChildren(c && c.type === Fragment ? c.props.children : c),
      )
    : [children]

export const Switch = ({
  children,
  location,
}: {
  location?: string
  children?: React.ReactNode
}) => {
  const router = useRouter()
  const originalLocation = getLocation(router)
  for (const element of flattenChildren(children)) {
    let match: any = 0
    if (
      isValidElement(element) && // we don't require an element to be of type Route,
      // but we do require it to contain a truthy `path` prop.
      // this allows to use different components that wrap Route
      // inside of a switch, for example <AnimatedRoute />.
      (match = matchRoute(
        router.parser,
        location || originalLocation,
        element.props.path,
        element.props.nest,
      ))[0]
    ) {
      return cloneElement(element as any, { match })
    }
  }
  return null
}

export function Redirect(
  props: NavigationalProps & { children?: never },
): null {
  const { to, href = to } = props
  const navigate = useNavigate()
  const redirect = useEvent(() => navigate((to ?? href)!, props))
  useIsomorphicLayoutEffect(() => {
    redirect()
  }, [])
  return null
}

interface MemoryHookReturnValue {
  hook: () => string
  navigate: typeof navigate
}
type Navigate = typeof navigate

/**
 * In-memory location that supports navigation
 */
export function memoryLocation(options?: {
  path?: string
  static?: boolean
  record?: false
}): MemoryHookReturnValue
export function memoryLocation(options?: {
  path?: string
  static?: boolean
  record: true
}): MemoryHookReturnValue & {
  history: string[]
  reset: () => void
}
export function memoryLocation({
  path = "/",
  static: staticLocation,
  record,
}: {
  path?: string
  static?: boolean
  record?: boolean
} = {}): MemoryHookReturnValue & {
  history?: string[]
  reset?: () => void
} {
  let currentPath = path
  const history = [currentPath]
  const emitter = new Set<(path: string) => void>()

  const navigateImplementation: Navigate = (
    path: string,
    { replace = false } = {},
  ) => {
    if (record) {
      if (replace) {
        history.splice(-1, 1, path)
      } else {
        history.push(path)
      }
    }

    currentPath = path
    for (const fn of emitter) fn(path)
  }

  const navigate = !staticLocation ? navigateImplementation : () => null

  const subscribe = (cb: (path: string) => void) => {
    emitter.add(cb)
    return () => emitter.delete(cb)
  }

  const useMemoryLocation = () =>
    useSyncExternalStore(subscribe, () => currentPath)

  function reset() {
    // clean history array with mutation to preserve link
    history.splice(0, history.length)

    navigateImplementation(path)
  }

  return {
    hook: useMemoryLocation,
    navigate,
    history: record ? history : undefined,
    reset: record ? reset : undefined,
  }
}
