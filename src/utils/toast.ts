import { createRoot } from "react-dom/client"
import { OverlayToaster, Position } from "@blueprintjs/core"

export const toaster = await OverlayToaster.createAsync(
  {
    position: Position.TOP,
  },
  {
    domRenderer: (toaster, containerElement) =>
      createRoot(containerElement).render(toaster),
  },
)
