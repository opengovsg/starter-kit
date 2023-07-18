import { useRouter } from 'next/router'
import { type ReactEventHandler } from 'react'
import { type RouterOutput } from '~/utils/trpc'
import { PostView } from './PostView'

export interface PostProps {
  post: RouterOutput['post']['byUser']['posts'][number]
  hideActions?: boolean
}

export const Post = ({ post, hideActions }: PostProps): JSX.Element => {
  const router = useRouter()

  const onClick: ReactEventHandler = async (e) => {
    // data-values are added to all post actions so that we can distinguish
    // between clicking on the post itself and clicking on an action, and only
    // navigate to the thread if the post itself is clicked
    const isAction = !!(e.target as HTMLElement).getAttribute('data-value')
    if (!isAction) {
      await router.push(`/thread/${post.id}`)
    }
  }

  return (
    <PostView
      containerProps={{
        onClick,
        py: '1.5rem',
        layerStyle: 'post',
        tabIndex: 0,
        cursor: 'pointer',
        role: 'button',
      }}
      post={post}
      hideActions={hideActions}
    />
  )
}
