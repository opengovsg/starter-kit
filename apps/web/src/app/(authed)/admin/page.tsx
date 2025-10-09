import { LogoutButton } from '~/app/_components/logout-button'

export default function TestPage() {
  return (
    <div>
      Admin page. You should only be able to see this if you are auth'd
      <LogoutButton />
    </div>
  )
}
