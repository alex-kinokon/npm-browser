import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

const DEFAULT_LOCALE = "en"
const LOCALE_KEY = "npm-browser:locale"
export const SUPPORTED_LOCALES = ["en", "fr", "ja", "zh-Hant"] as const

export type Locale = (typeof SUPPORTED_LOCALES)[number]

const LocaleContext = createContext<{
  locale: Locale
  setLocale: (locale: Locale) => void
}>(undefined!)

const { Provider } = LocaleContext

export function useLocaleContext() {
  return useContext(LocaleContext)
}

export function useLocale() {
  return useLocaleContext().locale
}

export const LocaleProvider = memo(
  ({ children }: { children: React.ReactNode }) => {
    // Always render with the fallback locale first to prevent hydration mismatch
    const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE)

    const updateLocale = useCallback((locale: Locale) => {
      setLocale(locale)
      try {
        localStorage.setItem(LOCALE_KEY, locale)
      } catch {}
    }, [])

    useEffect(() => {
      setLocale(getLocale())
    }, [])

    const value = useMemo(
      () => ({ locale, setLocale: updateLocale }),
      [locale, updateLocale],
    )

    return <Provider value={value}>{children}</Provider>
  },
)

function getLocale(): Locale {
  try {
    // Try localStorage first
    const stored = localStorage.getItem(LOCALE_KEY)
    if (stored) {
      return stored as Locale
    }
  } catch {}

  if (navigator.language.startsWith("fr-")) {
    return "fr"
  }

  const exactMatch = navigator.languages.find((lang) =>
    SUPPORTED_LOCALES.includes(lang as Locale),
  )
  if (exactMatch) {
    return exactMatch as Locale
  }

  const match = navigator.languages
    .map((lang) => lang.split("-")[0])
    .find((lang) => SUPPORTED_LOCALES.includes(lang as Locale))

  if (match) {
    return match as Locale
  }

  return DEFAULT_LOCALE
}

export function useT() {
  const locale = useLocale()
  const callback = useCallback(
    <T extends React.ReactNode = string>(record: {
      [locale in Locale]?: T
    }) => record[locale] ?? record[DEFAULT_LOCALE],
    [locale],
  )

  return callback
}

export function T(props: {
  [locale in Locale]?: React.ReactNode
}) {
  const t = useT()

  return <>{t(props)}</>
}
