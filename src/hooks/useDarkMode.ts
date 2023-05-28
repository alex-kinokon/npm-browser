import { useMediaQuery } from "@react-hookz/web"

export function useDarkMode() {
  return useMediaQuery("(prefers-color-scheme: dark)")
}
