import {
  ComponentProps,
  // eslint-disable-next-line no-restricted-imports
  Suspense as ReactSuspense,
  useEffect,
  useState,
} from 'react'

export default function Suspense(props: ComponentProps<typeof ReactSuspense>) {
  // This is needed so we only attempt to zrender and fire te queries within the suspense wrapper on client side mount
  // Not doing this will cause an error that the router instance has not been instantiated, and also will call queries outside of TRPC context
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (isMounted) {
    return <ReactSuspense {...props} />
  }
  return <>{props.fallback}</>
}
