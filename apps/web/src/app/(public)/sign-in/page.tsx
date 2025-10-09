import Image from 'next/image'
import Link from 'next/link'

import { env } from '~/env'
import { SignInWizard } from './_components/wizard'

export default function SignInPage() {
  return (
    <div className="lg:from-interaction-main-subtle-default flex flex-1 lg:bg-gradient-to-r lg:from-50% lg:to-white lg:to-50%">
      <div className="mx-auto flex flex-1 flex-col gap-2 lg:container lg:grid lg:grid-cols-12 lg:gap-4">
        <div className="bg-interaction-main-subtle-default col-span-4 min-h-55 max-sm:hidden lg:col-span-7 lg:h-full">
          <div className="max-lg:px-4">{/* Insert relevant image here */}</div>
        </div>
        <div className="col-span-3 col-start-9 mt-8 flex-1 lg:mt-[40%]">
          <div className="flex h-full w-full flex-col gap-4 max-lg:px-4">
            <h2 className="prose-h3 text-base-content-brand font-semibold">
              {/* Recommend max 2 lines of text here, or add logo */}
              {env.NEXT_PUBLIC_APP_NAME}
            </h2>
            <SignInWizard />
            <div className="prose-caption-3 my-12 flex whitespace-pre">
              Built by{' '}
              <Link
                href="https://www.open.gov.sg/"
                target="_blank"
                className="inline-flex"
              >
                <Image
                  src="/assets/restricted-ogp-text-logo.svg"
                  height={12}
                  width={232}
                  alt="Open Government Products"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
