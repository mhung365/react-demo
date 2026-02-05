import { useRef } from 'react'

/**
 * Logs whether a value's identity (reference) changed between renders.
 * React compares by reference for objects/arrays; "same content" ≠ "same reference".
 * Use to demonstrate why inline {} or [] break memo, useEffect deps, and Context.
 */
export function useIdentityLog(name: string, value: unknown): void {
  const ref = useRef<unknown>(Symbol('initial'))
  const prev = ref.current
  const sameRef = prev === value
  ref.current = value

  if (sameRef) {
    console.log(`[identity] ${name}: same reference`)
  } else {
    console.log(
      `[identity] ${name}: NEW reference (prev !== current). Values may look the same but React sees a change.`
    )
  }
}
