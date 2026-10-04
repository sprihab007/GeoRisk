import { useEffect, useState } from 'react'

// Delays updating the returned value until `value` has stopped changing for
// `delayMs`. Used on the search bar so we don't hit the geocoding API on
// every keystroke — only once the user pauses typing.
export function useDebounce(value, delayMs = 400) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer) // cancel the pending update if value changes again first
  }, [value, delayMs])

  return debounced
}
