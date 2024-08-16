import "@fontsource-variable/inter"
import "@fontsource-variable/roboto-condensed"
import { FocusStyleManager } from "@blueprintjs/core"
import { QueryClientProvider } from "@tanstack/react-query"
import { StrictMode, Suspense } from "react"

import favicon from "~/assets/favicon.svg"
import { Head } from "~/components/Head"
import { SideEffect } from "~/components/SideEffect"
import { LocaleProvider } from "~/Locale"
import { Router } from "~/vendor/wouter"

import { queryClient } from "./fetch-client"
import routes from "./routes"

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
