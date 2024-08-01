declare module "@uiw/react-markdown-preview" {
  export * from "@uiw/react-markdown-preview/lib/index"
  export { default } from "@uiw/react-markdown-preview/lib/index"
}

declare namespace React {
  interface Attributes {
    css?: string | (string | false)[]
  }
}
