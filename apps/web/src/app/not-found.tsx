import { NotFoundCard } from '~/app/_components/errors/not-found-card'

const NotFoundPage = () => (
  <main className="flex min-h-dvh flex-col items-center justify-center">
    <NotFoundCard
      title="Page Not Found"
      message="The page you are looking for does not exist or has been deleted."
    />
  </main>
)

export default NotFoundPage
