import "~/styles/globals.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Router, Switch } from "wouter"
import { Suspense } from "react"
import { FocusStyleManager } from "@blueprintjs/core"
import { SideEffect } from "~/components/SideEffect"
import { LocaleProvider } from "~/contexts/Locale"
import routes from "./routes.generated"
import { Head } from "~/components/Head"
import favicon from "~/assets/favicon.svg"

FocusStyleManager.onlyShowFocusOnTabs()

const client = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={client}>
      <Head>
        <link rel="icon" href={favicon} />
      </Head>
      <LocaleProvider>
        <SideEffect />
        <Router>
          <Suspense>
            <Switch>{routes}</Switch>
          </Suspense>
        </Router>
      </LocaleProvider>
    </QueryClientProvider>
  )
}
