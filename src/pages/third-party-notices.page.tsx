import { Divider, H2, HTMLSelect } from "@blueprintjs/core"
import { useEffect, useMemo, useState } from "react"
import { Head } from "~/components/Head"
import { PageHeader } from "~/components/Header"
import Footer, { thirdPartyNoticeLabel } from "~/components/Footer"
import { Container } from "~/components/Container"
import { useT } from "~/Locale"

export default function Home() {
  const t = useT()
  const [license, setLicense] = useState<Map<string, string>>()
  const [selected, setSelected] = useState<string>()
  const keys = useMemo(() => Array.from(license?.keys() ?? []), [license])

  useEffect(() => {
    void import("../licenses.generated.json").then(({ default: licenses }) => {
      const entries = Object.entries(licenses)
      setLicense(new Map(entries))
      setSelected(entries[0][0])
    })
  }, [])

  return (
    <div>
      <Head>
        <title>npm-browser</title>
      </Head>

      <PageHeader />

      <Container>
        <H2>{t(thirdPartyNoticeLabel)}</H2>
        <HTMLSelect
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {keys.map((key) => (
            <option key={key}>{key}</option>
          ))}
        </HTMLSelect>

        <pre>{license && selected ? license.get(selected) : "Loading..."}</pre>

        <Divider />
        <Footer />
      </Container>
    </div>
  )
}
