import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Selectors — semantic and role-based for resilience
  private readonly usernameInput = () => this.getByLabel('Username');
  private readonly passwordInput = () => this.getByLabel('Password');
  private readonly loginButton = () =>
    this.getByRole('button', { name: /log in/i });
  private readonly errorMessage = () =>
    this.page.locator('.error', { hasText: /invalid/i });
  private readonly registerLink = () =>
    this.page.getByRole('link', { name: /register/i });

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await super.goto('/parabank/index.htm');
    await this.waitForReady();
  }

  /** Login with credentials; resolves when the dashboard is loaded. */
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput().fill(username);
    await this.passwordInput().fill(password);
    await this.loginButton().click();
    // Wait for navigation away from the login page
    await this.page.waitForURL(/account/i, { timeout: 15_000 });
  }

  /** Attempt login and expect failure (negative test helper). */
  async loginExpectFailure(username: string, password: string): Promise<void> {
    await this.usernameInput().fill(username);
    await this.passwordInput().fill(password);
    await this.loginButton().click();
  }

  async assertLoginError(): Promise<void> {
    await expect(
      this.page.getByText(/error|invalid username|invalid password/i),
    ).toBeVisible();
  }

  async assertLoggedOut(): Promise<void> {
    await expect(this.usernameInput()).toBeVisible();
  }

  async clickRegister(): Promise<void> {
    await this.registerLink().click();
  }
}
