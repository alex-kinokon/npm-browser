import styled from "@emotion/styled"
import { Card, Classes, Divider, H2, H5 } from "@blueprintjs/core"
import { Head } from "~/components/Head"
import { PageHeader } from "~/components/Header"
import Footer from "~/components/Footer"

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  margin-top: 50px;
  margin-bottom: 100px;
`
const Container = styled.div`
  margin: 50px 100px;
`

const commonPackages = [
  "lodash",
  "react",
  "typescript",
  "graphql",
  "express",
  "next",
  "chalk",
]

export default function Home() {
  return (
    <div>
      <Head>
        <title>npm-browser</title>
      </Head>

      <PageHeader />

      <Container>
        <H2>npm-browser</H2>

        <Grid>
          <Card>
            <H5>Common Packages</H5>
            <ol className={Classes.LIST}>
              {commonPackages.map(pkg => (
                <li key={pkg}>
                  <a href={`/package/${pkg}`}>{pkg}</a>
                </li>
              ))}
            </ol>
          </Card>
        </Grid>

        <Divider />
        <Footer />
      </Container>
    </div>
  )
}
