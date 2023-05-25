import "@uiw/react-markdown-preview/markdown.css"
import { css } from "@emotion/css"
import dynamic from "next/dynamic"

export const Markdown = dynamic(() => import("@uiw/react-markdown-preview"), {
  ssr: false,
})

export const markdownStyle = css`
  font-family: inherit;
  overflow: hidden;
  tab-size: 2;
`
