import type { Element, Root, RootContent } from "hast"
import headings from "rehype-autolink-headings"
import rehypeIgnore from "rehype-ignore"
import { type RehypeRewriteOptions, getCodeString } from "rehype-rewrite"
import slug from "rehype-slug"
import type { PluggableList } from "unified"

import { copyElement } from "./copy"
import { octiconLink } from "./octiconLink"

export const rehypeRewriteHandle =
  (disableCopy: boolean, rewrite?: RehypeRewriteOptions["rewrite"]) =>
  (
    node: Root | RootContent,
    index: number | null,
    parent: Root | Element | null,
  ) => {
    if (
      node.type === "element" &&
      parent &&
      parent.type === "root" &&
      /h([1-6])/.test(node.tagName)
    ) {
      const child = node.children && (node.children[0] as Element)
      if (child && child.properties && child.properties.ariaHidden === "true") {
        child.properties = { class: "anchor", ...child.properties }
        child.children = [octiconLink]
      }
    }
    if (node.type === "element" && node.tagName === "pre" && !disableCopy) {
      const code = getCodeString(node.children)
      node.children.push(copyElement(code))
    }
    rewrite?.(
      node,
      index === null ? undefined : index,
      parent === null ? undefined : parent,
    )
  }

export const defaultRehypePlugins: PluggableList = [
  slug,
  headings,
  rehypeIgnore,
]
