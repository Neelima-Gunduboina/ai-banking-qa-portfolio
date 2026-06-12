/**
 * login.spec.ts — Login / authentication journeys.
 *
 * Maps to manual test experience:
 * - FLEXCUBE: user authentication gateway before accessing core banking modules
 * - Royal London: portal login with credential validation
 *
 * Covers: positive login, negative login, logout, session management.
 */

import { test, expect } from '../../fixtures';

test.describe('Login', () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // Force unauthenticated

  test('TC-L-01: successful login with valid credentials', async ({
    page,
    loginPage,
    testData,
  }) => {
    await loginPage.goto();
    await loginPage.login(
      testData.credentials.validUsername,
      testData.credentials.validPassword,
    );
    // Verify we're on the accounts page post-login
    await expect(
      page.getByRole('link', { name: /accounts overview/i }),
    ).toBeVisible();
  });

  test('TC-L-02: login fails with invalid credentials', async ({
    loginPage,
    testData,
  }) => {
    await loginPage.goto();
    await loginPage.loginExpectFailure(
      testData.credentials.invalidUsername,
      testData.credentials.invalidPassword,
    );
    await loginPage.assertLoginError();
  });

  test('TC-L-03: login fails with valid username and wrong password', async ({
    loginPage,
    testData,
  }) => {
    await loginPage.goto();
    await loginPage.loginExpectFailure(
      testData.credentials.validUsername,
      testData.credentials.invalidPassword,
    );
    await loginPage.assertLoginError();
  });

  test('TC-L-04: login fails with blank credentials', async ({
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.loginExpectFailure('', '');
    // Should remain on login page or show error
    await loginPage.assertLoginError();
  });

  test('TC-L-05: login page renders required form elements', async ({
    loginPage,
    page,
  }) => {
    await loginPage.goto();
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /register/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /forgot/i })).toBeVisible();
  });
});

test.describe('Logout', () => {
  test('TC-L-06: authenticated user can log out', async ({
    page,
    dashboardPage,
  }) => {
    // storageState from config already has auth
    await page.goto('/parabank/overview.htm');
    await expect(
      page.getByRole('link', { name: /accounts overview/i }),
    ).toBeVisible();

    await dashboardPage.logout();

    // Verify session terminated — login form visible
    await expect(page.getByLabel('Username')).toBeVisible();
  });
});
