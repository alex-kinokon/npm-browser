import { useEffect } from "react"

function getParentElement(target: EventTarget | null): null | HTMLElement {
  if (!target) return null
  const dom = target as HTMLElement
  if (dom.dataset.code && dom.classList.contains("copied")) {
    return dom
  }
  if (dom.parentElement) {
    return getParentElement(dom.parentElement)
  }
  return null
}

const handle = async (event: Event) => {
  const target = getParentElement(event.target)
  if (!target) return

  target.classList.add("active")

  await navigator.clipboard.writeText(target.dataset.code as string)
  setTimeout(() => {
    target.classList.remove("active")
  }, 2000)
}

export function useCopied(container: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    const node = container.current
    if (!node) return

    if (process.env.NODE_ENV === "development") {
      node.removeEventListener("click", handle, false)
    }
    node.addEventListener("click", handle, false)
    return () => {
      node.removeEventListener("click", handle, false)
    }
  }, [container])
}
