import { type ReactNode } from 'react'
import { type GetLayout } from '~/lib/types'

export const nestLayout = (parent: GetLayout, child: GetLayout) => {
  return (page: ReactNode) => parent(child(page))
}
