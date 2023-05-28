import { useMediaQuery } from "@react-hookz/web"
import { useEffect } from "react"

export function SideEffect() {
  const media = useMediaQuery("(prefers-color-scheme: dark)")
  useEffect(() => {
    document.body.classList.toggle("bp5-dark", media)
    document.head
      .querySelector("meta[name=theme-color]")
      ?.setAttribute("content", media ? "#0d1117" : "#fff")
  }, [media])

  return null
}
