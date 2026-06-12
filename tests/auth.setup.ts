/**
 * auth.setup.ts — Global setup that logs in once and saves storage state.
 * All authenticated test projects depend on this setup (see playwright.config.ts).
 * This avoids logging in before every single test, making the suite much faster.
 */

import { test as setup, expect } from '@playwright/test';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const AUTH_FILE = 'playwright/.auth/user.json';
const USERNAME = process.env.PARABANK_USERNAME ?? 'john';
const PASSWORD = process.env.PARABANK_PASSWORD ?? 'demo';
const BASE_URL = process.env.BASE_URL ?? 'https://parabank.parasoft.com';

setup('authenticate', async ({ page }) => {
  // Ensure the auth directory exists
  const authDir = path.dirname(AUTH_FILE);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  await page.goto(`${BASE_URL}/parabank/index.htm`);
  await page.waitForLoadState('networkidle');

  // Fill login form using accessible selectors
  await page.getByLabel('Username').fill(USERNAME);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: /log in/i }).click();

  // Verify we landed on the accounts overview or welcome page
  await expect(
    page.getByRole('link', { name: /accounts overview/i }),
  ).toBeVisible({ timeout: 20_000 });

  // Persist the authenticated browser state (cookies + localStorage)
  await page.context().storageState({ path: AUTH_FILE });
});
