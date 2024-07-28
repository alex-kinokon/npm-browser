import "@fontsource-variable/inter"
import "@fontsource-variable/roboto-condensed"
import { QueryClientProvider } from "@tanstack/react-query"
import { StrictMode, Suspense } from "react"
import { FocusStyleManager } from "@blueprintjs/core"
import { Router } from "~/vendor/wouter"
import { SideEffect } from "~/components/SideEffect"
import { LocaleProvider } from "~/Locale"
import routes from "./routes"
import { Head } from "~/components/Head"
import favicon from "~/assets/favicon.svg"
import { queryClient } from "./fetch-client"

FocusStyleManager.onlyShowFocusOnTabs()

export default function App() {
  return (
    <StrictMode>
      <Head>
        <link rel="icon" href={favicon} />
      </Head>
      <QueryClientProvider client={queryClient}>
        <LocaleProvider>
          <SideEffect />
          <Router>
            <Suspense>{routes}</Suspense>
          </Router>
        </LocaleProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}
