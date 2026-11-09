'use client'

import Image from 'next/image'

import { Link } from 'react-aria-components'

import { SignInWizard } from './wizard/wizard'

import { env } from '~/env'

/**
 * Exported for testing.
 */
export const SignInPageComponent = () => (
  <div className="flex flex-1 lg:bg-linear-to-r lg:from-interaction-main-subtle-default lg:from-50% lg:to-base-canvas-default lg:to-50%">
    <div className="mx-auto flex flex-1 flex-col gap-2 lg:container lg:grid lg:grid-cols-12 lg:gap-4">
      <div className="col-span-4 min-h-55 bg-interaction-main-subtle-default max-sm:hidden lg:col-span-7 lg:h-full">
        {/* Insert relevant image here */}
        <div className="max-lg:px-4" />
      </div>
      <div className="mt-8 flex-1 grid-cols-12 md:grid lg:col-span-3 lg:col-start-9 lg:mt-[40%] lg:flex">
        <div className="flex size-full flex-col gap-4 max-lg:px-4 md:col-span-6 md:col-start-4">
          <h2 className="prose-h3 text-base-content-brand">
            {/* Recommend max 2 lines of text here, or add logo */}
            {env.NEXT_PUBLIC_APP_NAME}
          </h2>
          <SignInWizard />
          <div className="my-12 flex items-center prose-caption-3 whitespace-pre">
            Built by{' '}
            <Link
              href="https://www.open.gov.sg/"
              target="_blank"
              className="inline-flex"
            >
              <Image
                className="size-auto"
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
