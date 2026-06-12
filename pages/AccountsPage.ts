import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export interface AccountSummary {
  id: string;
  balance: string;
  availableBalance: string;
}

export class AccountsPage extends BasePage {
  private readonly pageHeading = () =>
    this.page.getByRole('heading', { name: /accounts overview/i });
  private readonly accountsTable = () =>
    this.page.locator('#accountTable');
  private readonly totalBalance = () =>
    this.page.locator('#accountTable tfoot .money').first();

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await super.goto('/parabank/overview.htm');
    await this.waitForReady();
  }

  async assertPageLoaded(): Promise<void> {
    await expect(this.pageHeading()).toBeVisible();
    await expect(this.accountsTable()).toBeVisible();
  }

  /** Returns summary rows from the accounts table. */
  async getAccounts(): Promise<AccountSummary[]> {
    const rows = this.accountsTable().locator('tbody tr');
    const count = await rows.count();
    const results: AccountSummary[] = [];

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const cells = row.locator('td');
      const id = (await cells.nth(0).innerText()).trim();
      const balance = (await cells.nth(1).innerText()).trim();
      const available = (await cells.nth(2).innerText()).trim();
      if (id) results.push({ id, balance, availableBalance: available });
    }
    return results;
  }

  async assertAtLeastOneAccount(): Promise<void> {
    const accounts = await this.getAccounts();
    expect(accounts.length).toBeGreaterThan(0);
  }

  async clickAccount(accountId: string): Promise<void> {
    await this.page.getByRole('link', { name: accountId }).click();
    await this.waitForReady();
  }

  async getTotalBalance(): Promise<string> {
    return (await this.totalBalance().innerText()).trim();
  }
}
