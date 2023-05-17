import { useRouter } from 'next/router'
import {
  ComponentProps,
  // eslint-disable-next-line no-restricted-imports
  Suspense as ReactSuspense,
  useEffect,
  useState,
} from 'react'

export default function Suspense(props: ComponentProps<typeof ReactSuspense>) {
  // This is needed so we only attempt to render and fire the queries within the suspense wrapper on client side mount
  // Not doing this will cause an error that the router instance has not been instantiated, and also will call queries outside of TRPC context
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (router.isReady) {
      setIsMounted(true)
    }
  }, [router.isReady])

  if (isMounted) {
    return <ReactSuspense {...props} />
  }
  return <>{props.fallback}</>
}
