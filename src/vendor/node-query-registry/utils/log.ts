export function log(formatter: any, ...args: any[]) {
  if (process.env.NODE_ENV !== "production") {
    console.debug(formatter, args)
  }
}
