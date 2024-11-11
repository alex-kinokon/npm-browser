export interface FileResult {
  files: {
    [key: `/${string}`]: {
      size: number
      type: "File"
      path: string
      contentType: string
      hex: string
      isBinary: "false" | "true"
      linesCount: number
    }
  }
  totalSize: number
  fileCount: number
  shasum: string
  integrity: string
}
