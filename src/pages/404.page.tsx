import { Classes, Divider, H3 } from "@blueprintjs/core"
import { Link } from "wouter"
import { css, cx } from "@emotion/css"
import { Head } from "~/components/Head"
import { PageHeader } from "~/components/Header"
import Footer from "~/components/Footer"
import { Container } from "~/components/Container"
import { T } from "~/Locale"
import { parseRoute } from "./package/[...route]/index.page"

export default function NotFoundPage() {
  const maybe = parseRoute(location.pathname.slice(1).split("/"))
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
