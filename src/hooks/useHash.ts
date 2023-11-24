import { useCallback, useEffect, useState } from "react"

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

  const update = useCallback((hash: string) => {
    location.hash = `#${hash}`
  }, [])

  useEffect(() => {
    const handler = () => {
      setHash(getHash())
    }
    window.addEventListener("hashchange", handler)
    return () => {
      window.removeEventListener("hashchange", handler)
    }
  }, [])

  return [hash, update] as const
}
