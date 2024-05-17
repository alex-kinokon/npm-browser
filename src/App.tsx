import "~/styles/globals.css"
import { QueryClientProvider } from "@tanstack/react-query"
import { Router } from "wouter"
import { StrictMode, Suspense } from "react"
import { FocusStyleManager } from "@blueprintjs/core"
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
      <QueryClientProvider client={queryClient}>
        <Head>
          <link rel="icon" href={favicon} />
        </Head>
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
