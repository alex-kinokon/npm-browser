import { Suggest } from "@blueprintjs/select"
import { useCallback, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button, MenuItem } from "@blueprintjs/core"
import { css } from "@emotion/css"
import { useLocation } from "wouter"
import { Search } from "@blueprintjs/icons"
import { getSearchSuggestions } from "~/remote"
import { useDebouncedValue } from "~/hooks/useDebouncedValue"
import type { SearchResult } from "~/vendor/node-query-registry"
import { useT } from "~/contexts/Locale"

export function SearchView({ defaultQuery }: { defaultQuery?: string }) {
  const t = useT()
  const [, setLocation] = useLocation()
  const [query, setQuery] = useState<string | undefined>(defaultQuery)
  const debouncedQuery = useDebouncedValue(query, 500)

  const [activeItem, setActiveItem] = useState<string>()
  const goToSearch = useCallback(() => {
    setLocation(`/search/?query=${encodeURIComponent(query!)}`)
  }, [query, setLocation])

  const { data, isLoading } = useQuery(
    getSearchSuggestions({ text: debouncedQuery, size: 25 })
  )

  const list = data?.objects ?? []

  return (
    <Suggest<SearchResult>
      query={query}
      onQueryChange={setQuery}
      items={list}
      onItemSelect={(item, e) => {
        if (
          e?.type === "keyup" &&
          (e as React.KeyboardEvent<HTMLElement>).key === "Enter"
        ) {
          goToSearch()
        } else {
          setQuery(item.package.name)
          setLocation(`/package/${item.package.name}`)
        }
      }}
      activeItem={list.find(item => item.package.name === activeItem)}
      onActiveItemChange={item => setActiveItem(item?.package.name)}
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
      menuProps={{
        className: css`
          max-height: max(50vh, 400px);
          overflow: scroll;
        `,
      }}
      inputProps={{
        placeholder: t({
          en: "Search",
          fr: "Rechercher",
          ja: "検索",
          "zh-Hant": "搜尋",
        }),
        rightElement: (
          <Button icon={<Search />} minimal disabled={!query} onClick={goToSearch} />
        ),
      }}
      noResults={<MenuItem disabled={true} text="No results." />}
      inputValueRenderer={item => item.package.name}
      itemRenderer={(item, { handleClick, handleFocus, modifiers, ref }) => (
        <MenuItem
          key={item.package.name}
          onClick={handleClick}
          onMouseEnter={handleFocus}
          active={modifiers.active}
          disabled={modifiers.disabled}
          ref={ref}
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
