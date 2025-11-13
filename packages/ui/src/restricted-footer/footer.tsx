'use client'

import type { ComponentType } from 'react'
import { Link } from 'react-aria-components'

import { DEFAULT_SOCIAL_MEDIA_LINKS } from './constants'
import { FooterLink } from './footer-link'
import { RestrictedOgpHoriSvgr } from './restricted-ogp-hori-svgr'

interface FooterProps {
  appName: string
  navLinks?: { label: string; href: string }[]
  socialMediaLinks?: {
    label: string
    href: string
    Icon: ComponentType<{ className?: string }>
  }[]
}

export function RestrictedFooter({
  appName,
  navLinks = [],
  socialMediaLinks = DEFAULT_SOCIAL_MEDIA_LINKS,
}: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-base-canvas-brand-subtle px-4 py-12">
      <div className="container mx-auto flex flex-col gap-10">
        <div className="flex flex-col justify-between gap-4 lg:flex-row">
          <div className="prose-h4 flex-1">{appName}</div>
          {navLinks.length > 0 && (
            <nav className="prose-body-2 flex flex-1 flex-col justify-end gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:gap-6">
              {navLinks.map((link) => (
                <FooterLink
                  key={link.href}
                  className="text-interaction-links-neutral-default hover:text-interaction-links-neutral-hover inline-flex items-center gap-1 underline-offset-2 transition-colors hover:underline"
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
              {socialMediaLinks.map(({ label, href, Icon }, index) => (
                <Link
                  key={index}
                  target="_blank"
                  href={href}
                  aria-label={label}
                  className="hover:text-base-content-strong transition-colors"
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
