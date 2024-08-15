import { Button, Menu, MenuItem, Popover } from "@blueprintjs/core"
import { useSessionStorageValue } from "@react-hookz/web"

import { useT } from "~/Locale"

export const enum ColorScheme {
  System,
  Light,
  Dark,
}

export function useColorScheme() {
  return useSessionStorageValue("theme", {
    defaultValue: ColorScheme.System,
  })
}

export function ThemeSwitch() {
  const t = useT()
  const { value: theme, set } = useColorScheme()

  const localeList: {
    text?: string
    value: ColorScheme
  }[] = [
    {
      text: t({
        en: "System",
        fr: "Système",
      }),
      value: ColorScheme.System,
    },
    {
      text: t({
        en: "Light",
        fr: "Clair",
      }),
      value: ColorScheme.Light,
    },
    {
      text: t({
        en: "Dark",
        fr: "Sombre",
      }),
      value: ColorScheme.Dark,
    },
  ]

  return (
    <Popover
      content={
        <Menu>
          {localeList.map(({ text, value }) => (
            <MenuItem
              key={value}
              text={text}
              onClick={() => set(value)}
              active={value === theme}
            />
          ))}
        </Menu>
      }
      placement="bottom"
    >
      <Button icon="moon" minimal />
    </Popover>
  )
}
