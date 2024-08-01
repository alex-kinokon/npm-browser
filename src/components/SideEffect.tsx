import { useEffect } from "react"
import { useDarkMode } from "~/hooks/useDarkMode"

export function SideEffect() {
  const dark = useDarkMode()

  useEffect(() => {
    document.body.classList.toggle("bp5-dark", dark)
    document.body.classList.toggle("bp5-light", !dark)
    document.head
      .querySelector("meta[name=theme-color]")
      ?.setAttribute("content", dark ? "#0d1117" : "#fff")
  }, [dark])

  return null
}
