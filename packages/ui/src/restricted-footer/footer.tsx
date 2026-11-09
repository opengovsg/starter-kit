'use client'

import type { ComponentType } from 'react'

import { Link } from 'react-aria-components'

import { DEFAULT_SOCIAL_MEDIA_LINKS } from './constants'
import { FooterLink } from './footer-link'
import { RestrictedOgpHoriSvgr } from './restricted-ogp-hori-svgr'

const EMPTY_NAV_LINKS: { label: string; href: string }[] = []

interface FooterProps {
  appName: string
  navLinks?: { label: string; href: string }[]
  socialMediaLinks?: {
    label: string
    href: string
    Icon: ComponentType<{ className?: string }>
  }[]
}

export const RestrictedFooter = ({
  appName,
  navLinks = EMPTY_NAV_LINKS,
  socialMediaLinks = DEFAULT_SOCIAL_MEDIA_LINKS,
}: FooterProps) => {
  // oxlint-disable-next-line react/purity -- copyright year only; render-time drift is harmless.
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-base-canvas-brand-subtle px-4 py-12">
      <div className="container mx-auto flex flex-col gap-10">
        <div className="flex flex-col justify-between gap-4 lg:flex-row">
          <div className="flex-1 prose-h4">{appName}</div>
          {navLinks.length > 0 && (
            <nav className="flex flex-1 flex-col justify-end gap-4 prose-body-2 lg:flex-row lg:flex-wrap lg:items-center lg:gap-6">
              {navLinks.map((link) => (
                <FooterLink
                  key={link.href}
                  className="inline-flex items-center gap-1 text-interaction-links-neutral-default underline-offset-2 transition-colors hover:text-interaction-links-neutral-hover hover:underline"
                  {...link}
                />
              ))}
            </nav>
          )}
        </div>

        <hr className="text-base-divider-medium" />

        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
          <div className="flex flex-col gap-2">
            <span className="prose-caption-1 text-base-content-medium">
              Built by
            </span>
            <Link
              href="https://www.open.gov.sg/"
              target="_blank"
              aria-label="Open Government Products"
              rel="noreferrer"
            >
              <RestrictedOgpHoriSvgr />
            </Link>
          </div>

          <div className="flex flex-col gap-2 lg:items-end">
            <div className="flex flex-row gap-4">
              {socialMediaLinks.map(({ label, href, Icon }) => (
                <Link
                  key={href}
                  target="_blank"
                  href={href}
                  aria-label={label}
                  className="transition-colors hover:text-base-content-strong"
                >
                  <Icon className="size-8" />
                </Link>
              ))}
            </div>
            <p className="prose-legal text-base-content-medium">
              ©{currentYear} Open Government Products
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
