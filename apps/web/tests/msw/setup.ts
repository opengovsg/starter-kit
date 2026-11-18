import { postmanMails, server } from './server'

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  postmanMails.length = 0
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
