import "../vendor/react-markdown"
import { Classes, Divider, H3 } from "@blueprintjs/core"
import { css, cx } from "@emotion/css"
import invariant from "tiny-invariant"

import { Container } from "~/components/Container"
import Footer from "~/components/Footer"
import { Head } from "~/components/Head"
import { PageHeader } from "~/components/Header"
import { T } from "~/Locale"
import { Link, Redirect } from "~/vendor/wouter"

function parseRoute(routes: string[]) {
  switch (routes.length) {
    case 4:
      invariant(routes[2] === "v", "invalid route")
      return { name: routes.slice(0, 2).join("/"), version: routes[3] }
    case 3:
      invariant(routes[1] === "v", "invalid route")
      return { name: routes[0], version: routes[2] }
    case 2:
      return { name: routes.join("/"), version: undefined }
    case 1:
      return { name: routes[0], version: undefined }
    case 0:
      return
  }
}

export default function NotFoundPage() {
  const pathname = location.pathname.slice(1)
  const userMatch = /^~([^/]+)$/.exec(pathname)
  if (userMatch) {
    return <Redirect to={`/user/${userMatch[1]}`} />
  }

  const maybe = parseRoute(pathname.split("/"))
  const href =
    maybe != null &&
    `/package/${maybe.name}${maybe.version ? `/v/${maybe.version}` : ""}`
  const link = href && <Link href={href}>{href}</Link>

  return (
    <div>
      <Head>
        <title>npm-browser</title>
      </Head>

      <PageHeader />

      <Container>
        <H3>
          <T en="404: Page not found" fr="404 : Page introuvable" />
        </H3>
        {link && (
          <p className={cx(Classes.RUNNING_TEXT, css({ fontSize: "1em" }))}>
            <T
              en={<>Did you mean {link}?</>}
              fr={<>Vouliez-vous accéder à {link} ?</>}
              ja={<>もしかして {link}</>}
            />
          </p>
        )}
        <Divider />
        <Footer />
      </Container>
    </div>
  )
}
