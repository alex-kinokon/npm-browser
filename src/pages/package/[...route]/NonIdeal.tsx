import { Button, Card, NonIdealState, Spinner } from "@blueprintjs/core"
import { Error, Refresh } from "@blueprintjs/icons"

export function ErrorView({
  error,
  retry,
  isLoading,
}: {
  error?: unknown
  retry?: () => void
  isLoading?: boolean
}) {
  return (
    <Card>
      <NonIdealState
        icon={<Error size={64} />}
        title="Error"
        description={(error as Error)?.message ?? "Unknown error"}
        action={
          retry ? (
            <Button icon={<Refresh />} onClick={() => retry()} loading={isLoading}>
              Retry
            </Button>
          ) : undefined
        }
      />
    </Card>
  )
}

export function LoadingView() {
  return (
    <Card>
      <NonIdealState icon={<Spinner />} title="Loading" />
    </Card>
  )
}
