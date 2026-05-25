import dynamic from 'next/dynamic'

import { cn } from '@opengovsg/oui-theme'

import { ErrorSvg } from '@acme/ui/svgs'

const GoBackButton = dynamic(
  () =>
    import('./go-back-button').then((mod) => ({ default: mod.GoBackButton })),
  { ssr: false }
)

interface ErrorCardProps {
  fullscreen?: boolean
  title?: string
  message?: string
  svg?: React.ReactNode
}

const DEFAULT_ERROR_SVG = <ErrorSvg />

export const ErrorCard = ({
  fullscreen = true,
  title,
  message,
  svg = DEFAULT_ERROR_SVG,
}: ErrorCardProps) => {
  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-center',
        fullscreen ? 'gap-8 p-8' : 'gap-0 p-0'
      )}
    >
      {svg}

      <div className="flex flex-col items-center gap-4">
        <span className="prose-h2">{title}</span>
        <span className="prose-body-1">{message}</span>
        {/* {
          // TODO: Add Datadog or other logging session ID here
          ddSessionId && (
            <span className="prose-label-md">
              Session ID: <code>{ddSessionId}</code>
            </span>
          )
        } */}
      </div>

      <GoBackButton />
    </div>
  )
}
