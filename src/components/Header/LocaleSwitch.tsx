import { Button, Menu, MenuItem, Popover } from "@blueprintjs/core"

import type { Locale } from "~/Locale"
import { useLocaleContext } from "~/Locale"

const localeList: {
  text: string
  locale: Locale
}[] = [
  {
    text: "English",
    locale: "en",
  },
  {
    text: "Français",
    locale: "fr",
  },
  {
    text: "日本語",
    locale: "ja",
  },
  {
    text: "中文",
    locale: "zh-Hant",
  },
]

export function LocaleSwitch() {
  const { locale, setLocale } = useLocaleContext()

  return (
    <Popover
      content={
        <Menu>
          {localeList.map(({ text, locale: value }) => (
            <MenuItem
              key={value}
              text={text}
              lang={value}
              onClick={() => setLocale(value)}
              active={value === locale}
            />
          ))}
        </Menu>
      }
      placement="bottom"
    >
      <Button icon="globe-network" minimal />
    </Popover>
  )
}
