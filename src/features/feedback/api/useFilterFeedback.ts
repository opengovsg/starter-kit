import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import { z } from 'zod'
import { listPostsInputSchema } from '~/schemas/post'
import { trpc } from '~/utils/trpc'

const LIST_POSTS_PARAMS_SCHEMA = z.object({
  order: listPostsInputSchema.shape.order.catch(
    listPostsInputSchema.shape.order._def.defaultValue()
  ),
  filter: listPostsInputSchema.shape.filter.catch(
    listPostsInputSchema.shape.filter._def.defaultValue()
  ),
  limit: listPostsInputSchema.shape.limit.catch(null),
  cursor: listPostsInputSchema.shape.cursor.catch(null),
})

const FILTER_VAL_TO_LABEL = {
  all: 'All feedback',
  draft: 'Draft',
  unread: 'Unread',
  replied: 'Replied',
  repliedByMe: 'Replied by me',
  unreplied: 'Unreplied',
  unrepliedByMe: 'Unreplied by me',
}
const FILTER_OPTIONS = Object.entries(FILTER_VAL_TO_LABEL).map(
  ([value, label]) => ({
    value,
    label,
  })
)

const ORDER_VAL_TO_LABEL = {
  asc: 'Newest',
  desc: 'Oldest',
}

const ORDER_OPTIONS = Object.entries(ORDER_VAL_TO_LABEL).map(
  ([value, label]) => ({
    value,
    label,
  })
)

export const useFilterFeedback = () => {
  const router = useRouter()

  const { order, filter, cursor, limit } = useMemo(() => {
    return LIST_POSTS_PARAMS_SCHEMA.parse(router.query)
  }, [router.query])

  const handleFilterChange = useCallback(
    (filter: string | string[]) => {
      router.query.filter = filter
      router.push(router)
    },
    [router]
  )

  const handleOrderChange = useCallback(
    (order: string | string[]) => {
      router.query.order = order
      router.push(router)
    },
    [router]
  )

  const [filteredFeedback] = trpc.post.list.useSuspenseQuery(
    { order, filter, cursor, limit },
    { keepPreviousData: true }
  )

  return {
    filteredFeedback,
    filter: {
      value: filter,
      label: FILTER_VAL_TO_LABEL[filter],
      options: FILTER_OPTIONS,
    },
    handleFilterChange,
    order: {
      value: order,
      label: ORDER_VAL_TO_LABEL[order],
      options: ORDER_OPTIONS,
    },
    handleOrderChange,
  }
}
