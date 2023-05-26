import "~/styles/globals.css"
import type { AppProps } from "next/app"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { Hydrate, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { SideEffect } from "~/components/SideEffect"
import { LocaleProvider } from "~/contexts/Locale"

const getQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        cacheTime: 1000 * 60 * 60 * 24, // 24 hours
      },
    },
  })

const getPersister =
  process.env.NODE_ENV === "production"
    ? () => undefined!
    : () =>
        createSyncStoragePersister({
          storage: globalThis.localStorage,
        })

export default function App({ Component, pageProps }: AppProps) {
  const [client] = useState(getQueryClient)
  const [persister] = useState(getPersister)

  const children = (
    <LocaleProvider>
      <Hydrate state={pageProps.dehydratedState}>
        <SideEffect />
        <Component {...pageProps} />
      </Hydrate>
    </LocaleProvider>
  )

  if (process.env.NODE_ENV === "production") {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  } else {
    return (
      <PersistQueryClientProvider client={client} persistOptions={{ persister }}>
        {children}
      </PersistQueryClientProvider>
    )
  }
}
