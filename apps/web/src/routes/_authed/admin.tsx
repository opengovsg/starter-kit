import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/admin')({
  component: AdminRootPage,
})

function AdminRootPage() {
  return (
    <div>
      This is the root admin page. This page is gated by authentication and is
      only accessible to logged-in users.
    </div>
  )
}
