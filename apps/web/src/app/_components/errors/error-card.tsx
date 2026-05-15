'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@opengovsg/oui'
import { cn } from '@opengovsg/oui-theme'

import { ErrorSvg } from '@acme/ui/svgs'

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
  const router = useRouter()

  const handleBack = () => {
    // Next.js pre-renders 'use client' components on the server, where `window` is undefined
    if (typeof window === 'undefined') return
    // window.history.length is always >= 1 (current entry); > 1 means there's a previous entry
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

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

      <Button onPress={handleBack} color="neutral">
        Go Back
      </Button>
    </div>
  )
}
