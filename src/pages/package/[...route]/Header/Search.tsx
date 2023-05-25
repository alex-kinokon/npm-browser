import { Suggest } from "@blueprintjs/select"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { MenuItem } from "@blueprintjs/core"
import { css } from "@emotion/css"
import { useRouter } from "next/router"
import { getSearchSuggestions } from "~/remote"
import { useDebouncedValue } from "~/hooks/useDebouncedValue"

export function Search() {
  const router = useRouter()
  const [query, setQuery] = useState<string>()
  const debouncedQuery = useDebouncedValue(query, 500)

  const { data, isLoading } = useQuery({
    queryKey: ["search", debouncedQuery],
    enabled: !!debouncedQuery,
    queryFn: () =>
      getSearchSuggestions({
        text: debouncedQuery,
        size: 10,
      }),
  })

  const list = data?.objects ?? []

  return (
    <Suggest
      query={query}
      onQueryChange={setQuery}
      items={list}
      onItemSelect={item => {
        setQuery(item.package.name)
        router.push(`/package/${item.package.name}`)
      }}
      activeItem={list.find(item => item.package.name === query)}
      className={css`
        width: 100%;
      `}
      initialContent={
        isLoading && debouncedQuery ? (
          <MenuItem disabled={true} text="Loading..." />
        ) : null
      }
      popoverProps={{
        matchTargetWidth: true,
        minimal: true,
      }}
      noResults={<MenuItem disabled={true} text="No results." />}
      inputValueRenderer={item => item.package.name}
      itemRenderer={(item, { handleClick, handleFocus, modifiers }) => (
        <MenuItem
          key={item.package.name}
          onClick={handleClick}
          onMouseEnter={handleFocus}
          active={modifiers.active}
          text={
            <>
              <label
                className={css`
                  font-weight: 600;
                `}
              >
                {item.package.name}
              </label>
              <div
                className={css`
                  max-width: calc(min(600px, 80vw));
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                `}
              >
                {item.package.description}
              </div>
            </>
          }
        />
      )}
    />
  )
}
