import { Button, MenuItem } from "@blueprintjs/core"
import { Search } from "@blueprintjs/icons"
import { Suggest } from "@blueprintjs/select"
import { css } from "@emotion/css"
import { useQuery } from "@tanstack/react-query"
import { useCallback, useState } from "react"

import { useDebouncedValue } from "~/hooks/useDebouncedValue"
import { useT } from "~/Locale"
import { getSearchSuggestions } from "~/remote"
import type { SearchResult } from "~/vendor/node-query-registry"
import { useNavigate } from "~/vendor/wouter"

export function SearchView({ defaultQuery }: { defaultQuery?: string }) {
  const t = useT()
  const setLocation = useNavigate()
  const [query, setQuery] = useState<string | undefined>(defaultQuery)
  const debouncedQuery = useDebouncedValue(query, 500)

  const [activeItem, setActiveItem] = useState<string>()
  const goToSearch = useCallback(() => {
    setLocation(`/search/?query=${encodeURIComponent(query!)}`)
  }, [query, setLocation])

  const { data, isLoading } = useQuery(
    getSearchSuggestions({ text: debouncedQuery, size: 25 }),
  )

  const list = data?.objects ?? []

  return (
    <Suggest<SearchResult>
      activeItem={list.find((item) => item.package.name === activeItem)}
      inputValueRenderer={(item) => item.package.name}
      items={list}
      noResults={<MenuItem disabled={true} text="No results." />}
      query={query}
      className={css`
        width: 100%;
      `}
      initialContent={
        isLoading && debouncedQuery ? (
          <MenuItem disabled={true} text="Loading…" />
        ) : null
      }
      inputProps={{
        placeholder: t({
          en: "Search",
          fr: "Rechercher",
          ja: "検索",
          "zh-Hant": "搜尋",
        }),
        rightElement: (
          <Button
            minimal
            disabled={!query}
            icon={<Search />}
            onClick={goToSearch}
          />
        ),
      }}
      itemRenderer={(item, { handleClick, handleFocus, modifiers, ref }) => (
        <MenuItem
          active={modifiers.active}
          disabled={modifiers.disabled}
          key={item.package.name}
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
          onClick={handleClick}
          onMouseEnter={handleFocus}
        />
      )}
      menuProps={{
        className: css`
          max-height: max(50vh, 400px);
          overflow: scroll;
        `,
      }}
      popoverProps={{
        matchTargetWidth: true,
        minimal: true,
      }}
      onActiveItemChange={(item) => setActiveItem(item?.package.name)}
      onQueryChange={setQuery}
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
    />
  )
}
