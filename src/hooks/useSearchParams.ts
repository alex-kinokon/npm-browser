import { useCallback, useEffect, useMemo, useState } from "react"

type InitialType = {
  [key: string]: string | number | boolean | Date | string[] | Object | undefined
}

type SupportedType =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | DateConstructor

type TypesValue = SupportedType | string[] | Function

type TypesMap = {
  [key: string]: TypesValue
}

const SUPPORTED_PARAMS_TYPES = [Number, String, Boolean, Date]

function setQueryToCurrentUrl(params: InitialType): URL {
  const url = new URL(location.href)

  Object.keys(params).forEach(key => {
    const value: any = params[key]
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        url.searchParams.delete(key)
        value.forEach(valueItem => {
          url.searchParams.append(key, valueItem)
        })
      } else if (value instanceof Date) {
        if (!isNaN(value.getTime())) {
          url.searchParams.set(key, value.toISOString())
        }
      } else if (typeof value === "object") {
        url.searchParams.set(key, JSON.stringify(value))
      } else {
        url.searchParams.set(key, value)
      }
    } else {
      url.searchParams.delete(key)
    }
  })
  return url
}

function isNoneEmptyPrimitiveArray(input: any) {
  return (
    Array.isArray(input) &&
    input.length > 0 &&
    input.every(
      item =>
        typeof item === "number" || typeof item === "string" || typeof item === "boolean"
    )
  )
}

function validateTypes(types: TypesMap = {}): void {
  const isValidTypes = Object.values<TypesValue>(types).every(
    (type: TypesValue) =>
      SUPPORTED_PARAMS_TYPES.includes(type as SupportedType) ||
      isNoneEmptyPrimitiveArray(type) ||
      typeof type === "function"
  )

  if (!isValidTypes) {
    throw new Error(
      `Unsupported param types. Must be one of [${SUPPORTED_PARAMS_TYPES.map(
        item => item.name
      ).join(", ")}]`
    )
  }
}

export function useSearchParams<T extends InitialType>(
  initial: Partial<T>,
  types: TypesMap = {},
  replace = false
): [T, (nextQuery: Partial<T>) => void] {
  if (process.env.NODE_ENV === "development" && types) {
    validateTypes(types)
  }

  /**
   * The main idea of this hook is to make things response to change of `location.search`,
   * so no need for introducing new state (in the mean time).
   * Whenever `location.search` is changed but not cause re-render, call `forceUpdate()`.
   * Whenever the component - user of this hook - re-render, this hook should return
   * the query object that correspond to the current `location.search`
   */
  const [, forceUpdate] = useState<any>()

  const locationSearch = location.search

  const urlSearchParams = useMemo<URLSearchParams>(
    () => new URLSearchParams(locationSearch),
    [locationSearch]
  )

  const params = useMemo<T>(() => {
    const pairs: { key: string; value: string }[] = []

    urlSearchParams.forEach((value, key) => {
      pairs.push({ key, value })
    })

    // group by key
    const grouped = pairs.reduce((acc, val) => {
      ;(acc[val.key] = acc[val.key] || []).push(val)
      return acc
    }, {} as { [key: string]: { key: string; value: string }[] })

    const result = Object.keys(grouped).map(key => {
      const valueGroup = grouped[key]
      if (valueGroup.length === 1) {
        return [key, valueGroup[0].value] as const
      } else {
        return [key, valueGroup.map(({ value }) => value)] as const
      }
    })

    const params = { ...initial } as any

    result.forEach(([key, value]) => {
      params[key] = parseValue(key, value, types, initial)
    })

    return params
  }, [urlSearchParams])

  const redirectToNewSearchParams = useCallback(
    (params: InitialType): void => {
      const url = setQueryToCurrentUrl(params)

      if (location.search !== url.search) {
        if (replace) {
          history.replaceState({}, "", url.toString())
        } else {
          history.pushState({}, "", url.toString())
        }
      }
      if (urlSearchParams.toString() !== url.searchParams.toString()) {
        forceUpdate({})
      }
    },
    [replace, urlSearchParams]
  )

  useEffect(() => {
    redirectToNewSearchParams({
      ...initial,
      ...params,
    })
  }, [params])

  const setParams = useCallback(
    (params: InitialType) => {
      redirectToNewSearchParams(params)
    },
    [redirectToNewSearchParams]
  )

  useEffect(() => {
    const onPopState = () => {
      forceUpdate({})
    }
    window.addEventListener("popstate", onPopState)
    return () => {
      window.removeEventListener("popstate", onPopState)
    }
  }, [])

  return [params, setParams]
}

const booleanValues = {
  true: true,
  false: false,
}

function parseValue(
  key: string,
  _value: string | string[],
  types: TypesMap,
  defaultParams: InitialType
) {
  if (!types) return _value
  const type = types[key]
  const value = _value === undefined ? defaultParams[key] : _value

  if (type === Number) {
    return Number(value)
  }
  if (type === Boolean) {
    return booleanValues[value as "true" | "false"]
  }
  if (type === Date) {
    return new Date(value as string)
  }
  if (Array.isArray(type)) {
    // eslint-disable-next-line eqeqeq
    return type.find(item => item == value) || defaultParams[key]
  }
  if (typeof type === "function") {
    return type(value)
  }

  return value
}
