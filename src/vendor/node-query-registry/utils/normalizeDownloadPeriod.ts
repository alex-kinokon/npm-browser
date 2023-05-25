import type { DownloadPeriod } from "../types/downloadPeriod"

export function normalizeRawDownloadPeriod(
  rawDownloadPeriod: DownloadPeriod = "last-week"
): string {
  if (typeof rawDownloadPeriod === "string") {
    return rawDownloadPeriod
  }

  if (rawDownloadPeriod instanceof Date) {
    return getDay(rawDownloadPeriod)
  }

  const { start, end } = rawDownloadPeriod
  return `${getDay(start)}:${getDay(end)}`
}

function getDay(date: Date): string {
  return date.toISOString().split("T")[0]!
}
