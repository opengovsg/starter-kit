import Link from 'next/link'

import { LinkButton } from '@acme/ui/link-button'

export const LandingPageHeader = () => {
  return (
    <div className="col-span-full flex items-center justify-between py-2.5 md:col-span-10 md:col-start-2 md:py-[4.5rem]">
      <Link href="/">Starter Kit</Link>
      <div className="text-subhead-1 flex items-center gap-4 md:gap-8 xl:gap-10">
        <LinkButton href="/sign-in" variant="solid">
          {/*  TODO: Dynamically show go to app if user is already logged in */}
          Sign in
        </LinkButton>
      </div>
    </div>
  )
}
