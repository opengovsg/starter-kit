import { trpcMsw } from '../mockTrpc'
import { defaultUser } from './me'

const defaultPostListGetHandler = () => {
  return trpcMsw.post.list.query((_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.data({
        items: [
          {
            id: 'cljfbypn10002xlc6fesar9ni',
            title: null,
            content:
              'This is a test post by the default logged in user. You should be able to see the delete button',
            contentHtml:
              '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"This is a test post by the default logged in user. You should be able to see the delete button"}]}]}',
            images: [],
            createdAt: new Date('2023-06-28T06:23:18.349Z'),
            updatedAt: new Date('2023-06-28T06:23:18.349Z'),
            authorId: defaultUser.id,
            author: {
              image: null,
              name: defaultUser.name,
              username: defaultUser.username,
            },
            replies: [],
            _count: {
              replies: 0,
              likes: 0,
            },
          },
          {
            id: 'cljfbypn10002xlc6fesar9ns',
            title: null,
            content:
              'This post is by a different user. There should be no delete button.',
            contentHtml:
              '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"This post is by a different user. There should be no delete button."}]}]}',
            images: [],
            createdAt: new Date('2023-06-18T06:23:18.349Z'),
            updatedAt: new Date('2023-06-18T06:23:18.349Z'),
            authorId: 'different-id',
            author: {
              image: null,
              name: 'Different User',
              username: 'differentUser999',
            },
            replies: [],
            _count: {
              replies: 0,
              likes: 0,
            },
          },
        ],
        nextCursor: null,
      })
    )
  })
}

const emptyPostListGetHandler = () => {
  return trpcMsw.post.list.query((_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.data({
        items: [],
        nextCursor: null,
      })
    )
  })
}

export const postHandlers = {
  list: defaultPostListGetHandler,
  emptyList: emptyPostListGetHandler,
}
