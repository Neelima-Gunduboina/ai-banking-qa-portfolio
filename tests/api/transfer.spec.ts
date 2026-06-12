/**
 * transfer.spec.ts — REST API tests for fund transfer endpoint.
 *
 * Banking context: validates the same fund transfer business logic at the
 * API layer that the UI tests validate at the presentation layer. This dual
 * coverage (UI + API) is a best practice from FLEXCUBE testing — changes to
 * backend processing are caught by API tests even when UI appears unchanged.
 */

import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.BASE_URL ?? 'https://parabank.parasoft.com';
const USERNAME = process.env.PARABANK_USERNAME ?? 'john';
const PASSWORD = process.env.PARABANK_PASSWORD ?? 'demo';
const API_BASE = `${BASE_URL}/parabank/services/bank`;

/** Helper: login and return { customerId, accounts[] } */
async function loginAndGetAccounts(request: Parameters<typeof test>[1] extends { request: infer R } ? R : never) {
  const loginRes = await (request as import('@playwright/test').APIRequestContext).get(
    `${BASE_URL}/parabank/services/bank/login/${USERNAME}/password/${PASSWORD}`,
  );
  const customer = await loginRes.json();

  const accountsRes = await (request as import('@playwright/test').APIRequestContext).get(
    `${API_BASE}/customers/${customer.id}/accounts`,
  );
  const accounts = await accountsRes.json();
  return { customerId: customer.id as number, accounts: accounts as Array<{ id: number; balance: number }> };
}

test.describe('Transfer API', () => {
  test('TC-API-T-01: POST /transfer with valid accounts succeeds', async ({
    request,
  }) => {
    const { accounts } = await loginAndGetAccounts(request);

    if (accounts.length < 2) {
      test.skip(true, 'Need at least 2 accounts for transfer');
      return;
    }

    const fromId = accounts[0].id;
    const toId = accounts[1].id;

    const res = await request.post(
      `${API_BASE}/transfer?fromAccountId=${fromId}&toAccountId=${toId}&amount=10.00`,
    );

    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('Successfully transferred');
  });

  test('TC-API-T-02: transfer updates source account balance', async ({
    request,
  }) => {
    const { accounts } = await loginAndGetAccounts(request);

    if (accounts.length < 2) {
      test.skip(true, 'Need at least 2 accounts');
      return;
    }

    const fromId = accounts[0].id;
    const toId = accounts[1].id;

    // Capture before balance
    const beforeRes = await request.get(`${API_BASE}/accounts/${fromId}`);
    const before = await beforeRes.json();
    const balanceBefore: number = before.balance;

    await request.post(
      `${API_BASE}/transfer?fromAccountId=${fromId}&toAccountId=${toId}&amount=5.00`,
    );

    const afterRes = await request.get(`${API_BASE}/accounts/${fromId}`);
    const after = await afterRes.json();
    const balanceAfter: number = after.balance;

    expect(balanceAfter).toBeCloseTo(balanceBefore - 5.0, 2);
  });

  test('TC-API-T-03: transfer with negative amount returns error', async ({
    request,
  }) => {
    const { accounts } = await loginAndGetAccounts(request);

    if (accounts.length < 2) {
      test.skip(true, 'Need at least 2 accounts');
      return;
    }

    const res = await request.post(
      `${API_BASE}/transfer?fromAccountId=${accounts[0].id}&toAccountId=${accounts[1].id}&amount=-100.00`,
    );

    // Should return a 4xx/5xx or an error message body
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });
});
