import { extname } from "path"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { Markdown, markdownStyle } from "~/components/Markdown"
import { ErrorView, LoadingView } from "../NonIdeal"
import { getPackageFile } from "~/remote"

export function CodeView({
  file,
  package: pkg,
}: {
  file: { basename: string; hex: string }
  package: string
}) {
  const { data, isLoading, isError, error, refetch } = useQuery(
    getPackageFile(pkg, file.hex)
  )

  const ext = useMemo(() => {
    const ext = extname(file.basename)
    switch (ext) {
      case ".mjs":
        return "js"
      default:
        return ext.slice(1)
    }
  }, [file.basename])

  const code = useMemo(
    () => (ext === "md" ? data : "```" + ext + "\n" + data + "```"),
    [data, ext]
  )

  if (isError) {
    return <ErrorView error={error} isLoading={isLoading} retry={refetch} />
  } else if (isLoading) {
    return <LoadingView />
  } else if (!data) {
    return null
  }

  return (
    <div>
      <Markdown className={markdownStyle} source={code} />
    </div>
  )
}
