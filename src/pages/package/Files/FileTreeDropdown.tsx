import { basename, dirname } from "node:path"

import { Classes, InputGroup, Tree, type TreeNodeInfo } from "@blueprintjs/core"
import { FolderClose, FolderOpen } from "@blueprintjs/icons"
import { useSet } from "@react-hookz/web"
import { useState } from "react"

import { getIcon } from "./FileNavigation"

import type { MappedFile } from "./index"

function getTree(files: MappedFile[], expanded: Set<string>) {
  const root: TreeNodeInfo<MappedFile> = { childNodes: [], id: "/", label: "" }
  const treeMap = new Map<string, TreeNodeInfo>([["/", root]])
  function upsertDirectory(dir: string) {
    const node = treeMap.get(dir)
    if (node) {
      return node
    }
    const parent = dirname(dir)
    const parentNode = upsertDirectory(parent)
    const isExpanded = expanded.has(dir)
    const newNode: TreeNodeInfo = {
      id: dir,
      label: basename(dir),
      childNodes: [],
      icon: isExpanded ? <FolderOpen /> : <FolderClose />,
      isExpanded,
    }
    parentNode.childNodes!.push(newNode)
    treeMap.set(dir, newNode)
    return newNode
  }

  for (const file of files) {
    const directory = upsertDirectory(file.dirname)
    directory.childNodes!.push({
      id: file.path,
      label: file.basename,
      nodeData: file,
      icon: getIcon(file.basename),
      className: Classes.POPOVER_DISMISS,
    })
  }

  for (const { childNodes } of treeMap.values()) {
    childNodes!.sort((a, b) => {
      // priority directory -> name
      const aDirectory = a.childNodes != null
      const bDirectory = b.childNodes != null

      if (aDirectory && !bDirectory) {
        return -1
      } else if (!aDirectory && bDirectory) {
        return 1
      }

      return (a.label as string).localeCompare(b.label as string)
    })
  }

  return root.childNodes!
}

export function FileTreeSidebar({
  files,
  onNavigate,
}: {
  files: MappedFile[]
  onNavigate(path: string): void
}) {
  const expanded = useSet<string>()
  const [search, setSearch] = useState("")
  const contents = getTree(
    search ? files.filter((file) => file.path.includes(search)) : files,
    expanded,
  )

  return (
    <div css="max-h-[520px] w-80 overflow-y-scroll dark:border-slate-700 [&_.bp5-tree-node-caret]:pr-0 [&_svg]:mr-1">
      <InputGroup
        leftIcon="search"
        css="m-1"
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Tree
        contents={contents}
        onNodeExpand={(node) => expanded.add(node.id as string)}
        onNodeCollapse={(node) => expanded.delete(node.id as string)}
        onNodeClick={(node) => {
          if (!node.childNodes) {
            onNavigate(node.nodeData!.path)
          }
        }}
      />
    </div>
  )
}
