import { useRouter } from 'next/router'
import {
  type ComponentProps,
  // eslint-disable-next-line no-restricted-imports
  Suspense as ReactSuspense,
  useEffect,
  useState,
} from 'react'

export default function Suspense(props: ComponentProps<typeof ReactSuspense>) {
  // Tracking mounted state is needed so we only attempt to render and fire the queries within the suspense wrapper on mount instead
  // Not doing this will cause an error that the router instance has not been instantiated, and also will call trpc routes uninstantiated context
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // isReady conditional is needed so that suspenseQueries do not fire twice.
    // Without this, the child component will fire a query with an `undefined` query param followed by the actual query with param defined
    if (router.isReady) {
      setIsMounted(true)
    }
  }, [router.isReady])

  if (isMounted) {
    return <ReactSuspense {...props} />
  }
  return <>{props.fallback}</>
}
