import {
  BreadcrumbItem,
  type BreadcrumbItemProps,
  BreadcrumbLink,
} from '@chakra-ui/react'
import Link from 'next/link'

export interface CrumbProps extends BreadcrumbItemProps {
  href: string
  label: string
  last?: boolean
}
// Props are required as Breadcrumb parent injects props into its crumb children.
export const Crumb = ({ href, label, last = false, ...props }: CrumbProps) => {
  if (last) {
    return (
      <BreadcrumbItem isCurrentPage {...props}>
        <BreadcrumbLink
          _selected={{
            color: 'interaction.support.disabled-content',
            cursor: 'default',
            _hover: {
              textDecoration: 'none',
            },
          }}
          data-selected
        >
          {label}
        </BreadcrumbLink>
      </BreadcrumbItem>
    )
  }

  return (
    <BreadcrumbItem {...props}>
      <BreadcrumbLink color="interaction.main.default" as={Link} href={href}>
        {label}
      </BreadcrumbLink>
    </BreadcrumbItem>
  )
}
