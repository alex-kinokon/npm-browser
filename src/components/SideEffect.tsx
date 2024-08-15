import { useEffect } from "react"

import { useDarkMode } from "~/hooks/useDarkMode"

import { ColorScheme, useColorScheme } from "./Header/ThemeSwitch"

export function SideEffect() {
  const systemDark = useDarkMode()
  const { value: theme } = useColorScheme()
  const dark =
    theme === ColorScheme.System ? systemDark : theme === ColorScheme.Dark

  useEffect(() => {
    document.body.classList.toggle("bp5-dark", dark)
    document.body.classList.toggle("bp5-light", !dark)
    document.body.style.colorScheme = dark ? "dark" : "light"
    document.head
      .querySelector("meta[name=theme-color]")
      ?.setAttribute("content", dark ? "#0d1117" : "#fff")
  }, [dark])

  return null
}
