import { NotFoundSvg } from '@acme/ui/svgs'

import { ErrorCard } from './error-card'

interface NotFoundCardProps {
  title?: string
  message?: string
}

export const NotFoundCard = ({ title, message }: NotFoundCardProps) => {
  return (
    <ErrorCard
      title={title ?? 'Page Not Found'}
      message={message ?? 'The page you are looking for does not exist.'}
      svg={<NotFoundSvg />}
    />
  )
}
