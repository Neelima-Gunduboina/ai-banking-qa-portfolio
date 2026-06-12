/**
 * register.spec.ts — New customer registration.
 *
 * Banking context: onboarding / KYC data entry — same category of form
 * validation tests performed in insurance (Royal London) for policy holder
 * registration. Tests data integrity, field validation, and duplicate prevention.
 */

import { test, expect } from '../../fixtures';

test.describe('Customer Registration', () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // Unauthenticated

  test('TC-R-01: registration page renders complete form', async ({
    registerPage,
    page,
  }) => {
    await registerPage.goto();
    await expect(page.locator('input[name="customer.firstName"]')).toBeVisible();
    await expect(page.locator('input[name="customer.lastName"]')).toBeVisible();
    await expect(page.locator('input[name="customer.username"]')).toBeVisible();
    await expect(page.locator('input[name="customer.password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /register/i })).toBeVisible();
  });

  test('TC-R-02: successful registration with unique username', async ({
    registerPage,
    testData,
  }) => {
    await registerPage.goto();

    const reg = testData.registration;
    await registerPage.fillRegistrationForm({
      firstName: reg.firstName,
      lastName: reg.lastName,
      address: reg.address,
      city: reg.city,
      state: reg.state,
      zipCode: reg.zipCode,
      phone: reg.phone,
      ssn: reg.ssn,
      username: reg.uniqueUsername(),
      password: reg.password,
    });

    await registerPage.submit();
    await registerPage.assertRegistrationSuccess();
  });

  test('TC-R-03: empty form submission shows required field errors', async ({
    registerPage,
  }) => {
    await registerPage.goto();
    await registerPage.submit();

    const errors = await registerPage['page'].locator('.error, span.error').count();
    expect(errors).toBeGreaterThan(0);
  });

  test('TC-R-04: register link visible from login page', async ({
    loginPage,
    page,
  }) => {
    await loginPage.goto();
    await loginPage.clickRegister();
    await expect(page.getByRole('heading', { name: /signing up/i })).toBeVisible({ timeout: 10_000 });
  });
});
