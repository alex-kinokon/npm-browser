import { useCallback, useEffect, useState } from "react"
import { useLocation } from "~/vendor/wouter"

function getHash() {
  const { hash } = location
  const slash = hash.indexOf("/")
  if (slash === -1) {
    return [hash.slice(1)]
  }
  return [hash.slice(1, slash), hash.slice(slash + 1)]
}

export function useHash() {
  const [hash, setHash] = useState(getHash)

  const handler = useCallback(() => {
    setHash(getHash())
  }, [])

  const loc = useLocation()
  useEffect(handler, [loc])

  const update = useCallback((hash: string) => {
    location.hash = `#${hash}`
  }, [])

  useEffect(() => {
    window.addEventListener("hashchange", handler)
    window.addEventListener("popstate", handler)
    return () => {
      window.removeEventListener("hashchange", handler)
      window.removeEventListener("popstate", handler)
    }
  }, [])

  return [hash, update] as const
}
