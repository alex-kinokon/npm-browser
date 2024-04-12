export {}

declare module "react" {
  interface DOMAttributes<T> {
    css?: string
  }
}
