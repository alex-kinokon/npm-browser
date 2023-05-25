const units = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
const thresh = 1000

export function getFileSize(bytes: number, dp = 1) {
  if (Math.abs(bytes) < thresh) {
    return bytes + " B"
  }

  let u = -1
  const r = 10 ** dp

  do {
    bytes /= thresh
    ++u
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)

  return bytes.toFixed(dp) + " " + units[u]
}
