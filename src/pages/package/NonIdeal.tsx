import { Button, Card, NonIdealState, Spinner } from "@blueprintjs/core"
import { Error, Refresh } from "@blueprintjs/icons"

import { T } from "~/Locale"

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
        description={
          (error as Error)?.message ?? (
            <T en="Unknown error" fr="Erreur inconnue" />
          )
        }
        action={
          retry ? (
            <Button
              icon={<Refresh />}
              onClick={() => retry()}
              loading={isLoading}
            >
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
      <NonIdealState
        icon={<Spinner />}
        title={
          <T en="Loading" fr="Chargement" ja="読み込み中" zh-Hant="載入中" />
        }
      />
    </Card>
  )
}
