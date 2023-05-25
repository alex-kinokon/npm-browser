import { useQuery } from "@tanstack/react-query"
import { Markdown, markdownStyle } from "~/components/Markdown"
import { getPackageFile, getPackageFiles, getReadmeFileHex } from "~/remote"

export function Readme({ package: name, version }: { package: string; version: string }) {
  const { data: files } = useQuery(getPackageFiles(name, version))
  const readmeHex = getReadmeFileHex(files)
  const { data: readme } = useQuery(getPackageFile(name, readmeHex))

  return <Markdown className={markdownStyle} source={readme} />
}
