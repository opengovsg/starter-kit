import { useRouterState } from '@tanstack/react-router'

export function RouterProgressBar() {
  const isLoading = useRouterState({ select: (s) => s.isLoading })

  if (!isLoading) return null

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden">
      <div className="animate-router-progress h-full w-full bg-blue-500" />
    </div>
  )
}
