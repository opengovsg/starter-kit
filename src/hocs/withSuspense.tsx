import { type Attributes, type ComponentType, type ReactNode } from 'react'
import Suspense from '~/components/Suspense'

/**
 * Wraps the React Component with Suspense and FallbackComponent while loading.
 * @param  WrappedComponent - lazy loading component to wrap.
 * @param FallbackComponent - component to show while the WrappedComponent is loading.
 *
 * @example
 * ```
 * const lazySomeComponent = React.lazy(() => import('./xxx/SomeComponent'));
 *
 * export const SomeComponent = withSuspense(lazySomeComponent);
 *
 * export const SomeComponentWithCircularProgress = withSuspense(lazySomeComponent, <CircularProgress />);
 *
 * export const SomeComponentWithDiv = withSuspense(lazySomeComponent, <div>Loading...</div>);
 * ```
 *
 */
export function withSuspense<P>(
  WrappedComponent: ComponentType<P>,
  FallbackComponent: ReactNode | null = null,
) {
  const WithSuspense = (props: P) => {
    return (
      <Suspense fallback={FallbackComponent}>
        <WrappedComponent {...(props as P & Attributes)} />
      </Suspense>
    )
  }
  return WithSuspense
}
