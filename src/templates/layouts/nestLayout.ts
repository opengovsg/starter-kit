import { ReactNode } from 'react'
import { GetLayout } from '~/lib/types'

export const nestLayout = (parent: GetLayout, child: GetLayout) => {
  return (page: ReactNode) => parent(child(page))
}
