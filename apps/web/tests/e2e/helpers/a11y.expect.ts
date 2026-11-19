import { AxeBuilder } from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

/**
 * Run axe on the current page and fail on any WCAG A/AA violation. Every
 * page object `expect*` method ends with this (lint-enforced), and the `test`
 * in `~tests/e2e/test` also runs it on the page each test ends on.
 *
 * @see https://playwright.dev/docs/accessibility-testing
 */
export const expectNoA11yViolations = async (page: Page) => {
  const { violations } = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    // react-aria's visually hidden live announcer reads `aria-labelledby` via
    // `role="img"` nodes that outlive their label after a navigation.
    .exclude('[data-live-announcer]')
    .analyze()

  expect(violations).toEqual([])
}
