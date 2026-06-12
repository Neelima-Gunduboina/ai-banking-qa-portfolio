/**
 * accessibility.spec.ts — WCAG 2.1 AA accessibility checks using axe-core.
 *
 * Banking and insurance context:
 * - UK financial services are legally required to meet WCAG 2.1 AA under the
 *   Equality Act 2010 and FCA guidance (Royal London domain knowledge).
 * - FLEXCUBE deployments in regulated markets require accessibility sign-off.
 *
 * axe-core checks: critical violations = test failure; needs-review = warning.
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility (WCAG 2.1 AA)', () => {
  test('TC-A11Y-01: login page has no critical accessibility violations', async ({
    page,
  }) => {
    await page.goto('/parabank/index.htm');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('.footer-copyright') // Third-party footer, out of scope
      .analyze();

    // Log violations as annotations for review
    if (results.violations.length > 0) {
      const summary = results.violations
        .map((v) => `[${v.impact}] ${v.id}: ${v.description}`)
        .join('\n');
      console.log('Accessibility violations found:\n', summary);
    }

    // Critical and serious violations must be zero
    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(
      criticalViolations,
      `Critical a11y violations: ${criticalViolations.map((v) => v.id).join(', ')}`,
    ).toHaveLength(0);
  });

  test('TC-A11Y-02: accounts overview page is accessible', async ({ page }) => {
    await page.goto('/parabank/overview.htm');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(criticalViolations).toHaveLength(0);
  });

  test('TC-A11Y-03: transfer funds page is accessible', async ({ page }) => {
    await page.goto('/parabank/transfer.htm');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(criticalViolations).toHaveLength(0);
  });

  test('TC-A11Y-04: bill payment form is accessible', async ({ page }) => {
    await page.goto('/parabank/billpay.htm');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(criticalViolations).toHaveLength(0);
  });

  test('TC-A11Y-05: all form inputs have associated labels', async ({ page }) => {
    await page.goto('/parabank/index.htm');
    await page.waitForLoadState('networkidle');

    // Check for unlabelled inputs — common banking a11y failure
    const unlabelledInputs = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"])'));
      return inputs.filter((input) => {
        const id = input.getAttribute('id');
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');
        const labelFor = id ? document.querySelector(`label[for="${id}"]`) : null;
        return !ariaLabel && !ariaLabelledBy && !labelFor;
      }).length;
    });

    expect(unlabelledInputs).toBe(0);
  });
});
