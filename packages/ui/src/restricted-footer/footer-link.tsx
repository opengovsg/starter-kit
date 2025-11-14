import { Link } from 'react-aria-components'
import { BiLinkExternal } from 'react-icons/bi'

export const FooterLink = ({
  label,
  href,
  className,
}: {
  label: string
  href: string
  className?: string
}) => {
  const isExternal = href.startsWith('http')
  return (
    <Link
      href={href}
      target={isExternal ? '_blank' : undefined}
      className={className}
    >
      {label}
      {isExternal && <BiLinkExternal aria-hidden />}
    </Link>
  )
}
