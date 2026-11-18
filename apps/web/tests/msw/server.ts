import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

export const postmanMails: {
  body: string
  recipient: string
  subject: string
}[] = []

export const server = setupServer(
  http.post(
    'https://api.postman.gov.sg/v1/transactional/email/send',
    async ({ request }) => {
      postmanMails.push(
        (await request.json()) as {
          body: string
          recipient: string
          subject: string
        }
      )

      return HttpResponse.json({ ok: true })
    }
  )
)
