import { createPortal } from "react-dom"

export function Head({ children }: { children: React.ReactNode }) {
  return createPortal(children, document.head)
}
