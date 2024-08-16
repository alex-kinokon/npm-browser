import clsx from "clsx"
import React, { forwardRef, useImperativeHandle, useMemo } from "react"
import ReactMarkdown, { type Options, type UrlTransform } from "react-markdown"
import raw from "rehype-raw"
import type { RehypeRewriteOptions } from "rehype-rewrite"
import gfm from "remark-gfm"
import { remarkAlert } from "remark-github-blockquote-alert"
import { type PluggableList } from "unified"

import { useCopied } from "./useCopied"

/**
 * https://github.com/uiwjs/react-md-editor/issues/607
 */
const defaultUrlTransform: UrlTransform = (url) => url

export const MarkdownPreview = forwardRef<
  MarkdownPreviewRef,
  MarkdownPreviewProps
>((props, ref) => {
  const {
    className,
    source,
    style,
    disableCopy = false,
    skipHtml = true,
    onScroll,
    rehypeRewrite: rewrite,
    wrapperElement,
    urlTransform,
    ...other
  } = props

  const mdp = React.useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => ({ ...props, mdp }), [mdp, props])
  useCopied(mdp)

  const rehypePlugins = useMemo(() => {
    const plugins: PluggableList = [...(other.rehypePlugins || [])]
    if (skipHtml) {
      plugins.push(raw)
    }
    return plugins
  }, [skipHtml, other.rehypePlugins])

  const remarkPlugins = useMemo(
    () => [remarkAlert, ...(other.remarkPlugins || []), gfm],
    [other.remarkPlugins],
  )

  return (
    <div
      ref={mdp}
      onScroll={onScroll}
      {...wrapperElement}
      className={clsx("wmde-markdown", className)}
      style={style}
    >
      <ReactMarkdown
        allowElement={(element, index, parent) =>
          other.allowElement?.(element, index, parent) ??
          /^[\dA-Za-z]+$/.test(element.tagName)
        }
        {...other}
        skipHtml={skipHtml}
        urlTransform={urlTransform || defaultUrlTransform}
        rehypePlugins={rehypePlugins}
        remarkPlugins={remarkPlugins}
      >
        {source ?? ""}
      </ReactMarkdown>
    </div>
  )
})

export interface MarkdownPreviewProps extends Omit<Options, "children"> {
  className?: string
  source?: string
  disableCopy?: boolean
  style?: React.CSSProperties
  wrapperElement?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > & {
    "data-color-mode"?: "light" | "dark"
  }
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void
  onMouseOver?: (e: React.MouseEvent<HTMLDivElement>) => void
  rehypeRewrite?: RehypeRewriteOptions["rewrite"]
}

export interface MarkdownPreviewRef extends MarkdownPreviewProps {
  mdp: React.RefObject<HTMLDivElement>
}
