import { css } from "@emotion/css"
import { Alignment, Navbar } from "@blueprintjs/core"
import { SiNpm } from "react-icons/si"
import { Link } from "wouter"
import { SearchView } from "./Search"
import { LocaleSwitch } from "./LocaleSwitch"

export function PageHeader({ defaultQuery }: { defaultQuery?: string }) {
  return (
    <Navbar
      className={css`
        position: sticky;
        top: 0;
      `}
    >
      <div
        className={css`
          display: flex;
          align-items: center;
        `}
      >
        <Navbar.Group align={Alignment.LEFT}>
          <Link href="/">
            <Navbar.Heading
              className={css`
                margin-right: 0;
              `}
            >
              <SiNpm
                fill="#cb3837"
                className={css`
                  display: block;
                  font-size: 1.5em;
                  cursor: pointer;
                `}
              />
            </Navbar.Heading>
          </Link>
          <Navbar.Divider />
        </Navbar.Group>
        <Navbar.Group
          className={css`
            flex: 1;
          `}
        >
          <div
            className={css`
              width: 50%;
            `}
          >
            <SearchView defaultQuery={defaultQuery} />
          </div>
        </Navbar.Group>

        <Navbar.Group align={Alignment.RIGHT}>
          <LocaleSwitch />
          <div
            className={css`
              opacity: 0.8;
              margin-left: 5px;
              margin-right: 10px;
            `}
          >
            #{process.env.GIT_COMMIT}
          </div>
        </Navbar.Group>
      </div>
    </Navbar>
  )
}
