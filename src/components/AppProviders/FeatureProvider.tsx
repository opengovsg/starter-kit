import {
  createContext,
  type FC,
  type PropsWithChildren,
  useContext,
} from 'react'
import { env } from '~/env.mjs'

type FeatureContextProps = {
  storage: boolean
  sgid: boolean
}

// Exported for testing.
export const FeatureContext = createContext<FeatureContextProps | undefined>(
  undefined
)

/**
 * Provider component that wraps your app and makes the available features available to any
 * child component that calls `useFeatures()`.
 */
export const FeatureProvider: FC<PropsWithChildren> = ({ children }) => {
  const features = useProvideFeatures()

  return (
    <FeatureContext.Provider value={features}>
      {children}
    </FeatureContext.Provider>
  )
}

/**
 * Hook for components nested in FeatureProvider component to get the current feature object.
 */
export const useFeatures = (): FeatureContextProps => {
  const context = useContext(FeatureContext)
  if (!context) {
    throw new Error(
      `useFeatures must be used within a FeatureProvider component`
    )
  }
  return context
}

// Provider hook that return the current features object
const useProvideFeatures = () => {
  return {
    storage: !!env.NEXT_PUBLIC_ENABLE_STORAGE,
    sgid: !!env.NEXT_PUBLIC_ENABLE_SGID,
  }
}
