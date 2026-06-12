/**
 * testData.ts — Typed, centralized test data factory.
 * Credentials come from environment variables so nothing sensitive is
 * hardcoded. The suite gracefully degrades to placeholder values if env
 * vars are absent, making local setup friction-free.
 */

import dotenv from 'dotenv';
dotenv.config();

export interface TestData {
  credentials: {
    validUsername: string;
    validPassword: string;
    invalidUsername: string;
    invalidPassword: string;
  };
  registration: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    ssn: string;
    uniqueUsername: () => string;
    password: string;
  };
  transfer: {
    smallAmount: string;
    largeAmount: string;
  };
  billPayment: {
    payeeName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    accountNumber: string;
    amount: string;
  };
}

export function makeTestData(): TestData {
  return {
    credentials: {
      validUsername: process.env.PARABANK_USERNAME ?? 'john',
      validPassword: process.env.PARABANK_PASSWORD ?? 'demo',
      invalidUsername: 'invalid_user_xyz_9999',
      invalidPassword: 'wrongpass123',
    },
    registration: {
      firstName: 'Neelima',
      lastName: 'Gunduboina',
      address: '123 Test Street',
      city: 'London',
      state: 'LN',
      zipCode: 'EC1A 1BB',
      phone: '07700900000',
      ssn: '123-45-6789',
      uniqueUsername: () => `neelima_${Date.now()}`,
      password: 'SecurePass@2024',
    },
    transfer: {
      smallAmount: '10.00',
      largeAmount: '999999.00',
    },
    billPayment: {
      payeeName: 'BT Broadband',
      address: '456 Payee Lane',
      city: 'Manchester',
      state: 'MN',
      zipCode: 'M1 1AE',
      phone: '01619990000',
      accountNumber: '12345',
      amount: '50.00',
    },
  };
}
