import { css } from "@emotion/css"
import { Alignment, Button, Navbar } from "@blueprintjs/core"
import { Menu } from "@blueprintjs/icons"
import Icon from "@aet/icons/macro"
import { Link } from "~/vendor/wouter"
import { SearchView } from "./Search"
import { LocaleSwitch } from "./LocaleSwitch"

export function PageHeader({ defaultQuery }: { defaultQuery?: string }) {
  return (
    <Navbar css="sticky top-0">
      <div css="flex items-center">
        <Navbar.Group align={Alignment.LEFT}>
          <Link href="/">
            <Navbar.Heading css="mr-0">
              <Icon
                icon="SiNpm"
                fill="#cb3837"
                css="block cursor-pointer text-[1.5em]"
              />
            </Navbar.Heading>
          </Link>
          <Navbar.Divider />
        </Navbar.Group>
        <Navbar.Group css="flex-1">
          <div
            className={css`
              width: 50%;
              @media (max-width: 768px) {
                width: 99%;
              }
            `}
          >
            <SearchView defaultQuery={defaultQuery} />
          </div>
        </Navbar.Group>

        <Navbar.Group align={Alignment.RIGHT}>
          <LocaleSwitch />
          <div
            css="ml-1 mr-2 opacity-80"
            className={css`
              @media (max-width: 768px) {
                display: none;
              }
            `}
          >
            #{process.env.GIT_COMMIT}
          </div>
          {false && <Button icon={<Menu />} minimal />}
        </Navbar.Group>
      </div>
    </Navbar>
  )
}
