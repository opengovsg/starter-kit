'use client'

import Image from 'next/image'
import { Link } from 'react-aria-components'
import { BiRightArrowAlt } from 'react-icons/bi'

import { LinkButton } from '@acme/ui/link-button'
import { RestrictedFooter } from '@acme/ui/restricted-footer'

import { AUTHED_ROOT_ROUTE, LOGIN_ROUTE } from '~/constants'
import { FeatureItem } from './feature-item'
import { LandingPageHeader } from './header'
import { LandingSection, SectionBody, SectionHeader } from './section'

interface LandingPageComponentProps {
  appName: string
  isAuthed: boolean
}

/**
 * Exported for testing.
 */
export const LandingPageComponent = ({
  isAuthed,
  appName,
}: LandingPageComponentProps) => {
  const ctaLink = isAuthed ? AUTHED_ROOT_ROUTE : LOGIN_ROUTE

  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-base-canvas-brand-subtle">
        <div className="container mx-auto px-4">
          <LandingPageHeader isAuthed={isAuthed} />
          <div className="flex flex-col py-14 md:flex-row md:py-22">
            <div className="flex flex-1 flex-col">
              <h1 className="lg:prose-responsive-display-heavy-1280 md:prose-responsive-display-heavy-480 prose-responsive-display-heavy text-base-content-strong">
                Build production ready applications in minutes.
              </h1>
              <p className="prose-body-1 text-base-content-default mt-4">
                StarterApp is our baseline application created by StarterKit.
                You can explore it to get a sense of basic functions and
                interactions.
              </p>
              <div className="mt-10">
                <LinkButton
                  href={ctaLink}
                  endContent={<BiRightArrowAlt className="size-6" />}
                >
                  Explore StarterApp
                </LinkButton>
              </div>
            </div>
            <div className="flex flex-1 justify-end" aria-hidden="true">
              <Image
                src="/assets/landing-banner.svg"
                alt="StarterApp hero"
                width={480}
                height={400}
              />
            </div>
          </div>
        </div>
      </div>
      <LandingSection>
        <SectionHeader>Our application features</SectionHeader>
        <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          <FeatureItem
            title="Example feature 1"
            description="This is a description of one of the features in the application"
          />
          <FeatureItem
            title="Example feature 2"
            description="This is a description of one of the features in the application"
          />
          <FeatureItem
            title="Example feature 3"
            description="This is a description of one of the features in the application"
          />
        </div>
      </LandingSection>
      <LandingSection className="bg-base-canvas-brand-subtle">
        <div className="flex flex-col items-center gap-6 py-14 md:gap-12 md:py-22 lg:flex-row lg:gap-30">
          <div className="flex flex-1 flex-col gap-4">
            <SectionHeader>Another call to action</SectionHeader>
            <SectionBody>
              Sign in with your email address, and start building your app
              immediately. It's free, and requires no onboarding or approvals.
            </SectionBody>
            <div className="mt-10">
              <LinkButton href={ctaLink}>Get started</LinkButton>
            </div>
          </div>
          <div className="flex-1" aria-hidden="true">
            <Image
              src="/assets/landing-banner.svg"
              alt="StarterApp hero"
              width={480}
              height={400}
            />
          </div>
        </div>
      </LandingSection>
      <LandingSection>
        <SectionHeader>
          All the government tools you need to manage your workflow
        </SectionHeader>
        <SectionBody>
          Check out the <strong>Open Government Products Suite</strong>, and if
          you are a public officer you can mix and match from our set of
          productivity and collaboration tools.{' '}
          <Link
            href="https://reports.open.gov.sg/products"
            target="_blank"
            rel="noopener noreferrer"
            className="text-interaction-main-default hover:text-interaction-main-hover inline-flex items-center gap-0.5 underline underline-offset-4"
          >
            Full list of OGP products
            <BiRightArrowAlt className="text-2xl" />
          </Link>
        </SectionBody>
      </LandingSection>
      <LandingSection
        classNames={{
          section: 'bg-base-content-strong',
          inner: 'items-center gap-8',
        }}
      >
        <Image
          alt="ogp brand logo"
          src="/assets/restricted-landing-ogp-logo.svg"
          aria-hidden
          width={56}
          height={56}
        />
        <SectionHeader className="text-white">
          Start building your app now
        </SectionHeader>
        <LinkButton href={ctaLink}>Get started</LinkButton>
      </LandingSection>
      <RestrictedFooter
        appName={appName}
        navLinks={[
          // Add more nav links as application requires, e.g.
          // { href: 'https://example.com', label: 'Guide' },
          // { href: '/privacy', label: 'Privacy' },
          // { href: '/terms-of-use', label: 'Terms of use' },
          {
            href: 'https://go.gov.sg/report-vulnerability',
            label: 'Report vulnerability',
          },
        ]}
      />
    </div>
  )
}
