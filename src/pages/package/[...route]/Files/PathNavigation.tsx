import styled from "@emotion/styled"
import { memo } from "react"

export const PathNavigation = memo<{
  package: string
  path: string
  setPath: (path: string) => void
}>(({ package: name, path, setPath }) => {
  const pathSegments: React.ReactNode[] = path
    .split("/")
    .slice(1)
    .map((segment, index, array) => (
      <span key={index}>
        {index === array.length - 1 ? (
          <span>{segment}</span>
        ) : (
          <>
            <a
              href="#"
              onClick={event => {
                event.preventDefault()
                setPath(path.slice(0, path.indexOf(segment) + segment.length))
              }}
            >
              {segment}
            </a>
            {" / "}
          </>
        )}
      </span>
    ))

  pathSegments.unshift(
    <a
      key="/"
      href="#"
      onClick={event => {
        event.preventDefault()
        setPath("/")
      }}
    >
      {name}
    </a>,
    " / "
  )

  return <Header>{pathSegments}</Header>
})

const Header = styled.header`
  margin-bottom: 10px;
`
