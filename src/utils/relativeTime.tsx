import { memo, useMemo } from "react"
import { useLocale } from "~/Locale"

const is = (interval: number, cycle: number) =>
  cycle >= interval ? Math.round(cycle / interval) : 0

export function relativeTime(
  time: Date | number,
  {
    now = Date.now(),
    locale,
    ...options
  }: Intl.RelativeTimeFormatOptions & { now?: number; locale?: string },
) {
  const formatter = new Intl.RelativeTimeFormat(locale, {
    style: "long",
    ...options,
  })

  if (time instanceof Date) {
    time = time.valueOf()
  }

  const secs = (now - time) / 1000
  const mins = is(60, secs)
  const hours = is(60, mins)
  const days = is(24, hours)
  const weeks = is(7, days)
  const months = is(30, days)
  const years = is(12, months)

  const get = (value: number, unit: Intl.RelativeTimeFormatUnit) =>
    formatter.format(-Math.round(value), unit)

  if (secs <= 1) {
    return "just now"
  } else if (years > 0) {
    return get(years, "years")
  } else if (months > 0) {
    return get(months, "months")
  } else if (weeks > 0) {
    return get(weeks, "weeks")
  } else if (days > 0) {
    return get(days, "days")
  } else if (hours > 0) {
    return get(hours, "hours")
  } else if (mins > 0) {
    return get(mins, "minutes")
  } else if (secs > 0) {
    return get(secs, "seconds")
  } else {
    return get(years, "years")
  }
}

export const RelativeTime = memo(
  ({ date }: { date: Date | string | number }) => {
    const locale = useLocale()
    const t = useMemo(() => new Date(date), [date])
    return (
      <time dateTime={t.toISOString()} title={t.toLocaleString()}>
        {relativeTime(t, { locale })}
      </time>
    )
  },
)
