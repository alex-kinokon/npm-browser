import "./styles/markdown.scss"
import { forwardRef } from "react"
import rehypeAttrs from "rehype-attr"
import rehypePrism from "rehype-prism-plus"
import rehypeRaw from "rehype-raw"
import rehypeRewrite from "rehype-rewrite"
import type { PluggableList } from "unified"

import { MarkdownPreview } from "./src/preview"
import type { MarkdownPreviewProps, MarkdownPreviewRef } from "./src/preview"
import { defaultRehypePlugins, rehypeRewriteHandle } from "./src/rehypePlugins"

export default forwardRef<MarkdownPreviewRef, MarkdownPreviewProps>(
  (props, ref) => {
    const rehypePlugins: PluggableList = [
      rehypeRaw,
      ...defaultRehypePlugins,
      [
        rehypeRewrite,
        {
          rewrite: rehypeRewriteHandle(
            props.disableCopy ?? false,
            props.rehypeRewrite,
          ),
        },
      ],
      [rehypeAttrs, { properties: "attr" }],
      ...(props.rehypePlugins || []),
      [rehypePrism, { ignoreMissing: true }],
    ]
    return (
      <MarkdownPreview {...props} rehypePlugins={rehypePlugins} ref={ref} />
    )
  },
)
