# AI-Powered Banking QA Portfolio

> **Playwright + TypeScript test automation framework with GenAI capabilities** —
> self-healing locators, LLM-driven test generation, AI failure triage, and
> Playwright MCP browser control. Built against ParaBank, a public banking demo
> that mirrors real-world fund transfer, bill payment, and account management flows.

[![CI](https://github.com/YOUR_GITHUB_USERNAME/ai-banking-qa-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_GITHUB_USERNAME/ai-banking-qa-portfolio/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.49-green)](https://playwright.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## About This Project

I am a QA Engineer with **4+ years of manual testing experience** in:
- **Banking** — FLEXCUBE core banking: fund transfers, GL postings, account management, payments
- **Insurance** — Royal London: policy lifecycle, claims processing, portal accessibility compliance

This portfolio project demonstrates that I can **both write solid automation AND apply
GenAI tooling intelligently** — not as a buzzword, but as a practical force-multiplier
with clear human oversight at every step.

---

## GenAI Features

| Feature | Implementation | What It Proves |
|---------|---------------|----------------|
| **Self-Healing Locators** | `utils/self-heal.ts` | Reduces locator maintenance cost; LLM re-resolves broken selectors from the accessibility tree |
| **AI Test Generation** | `scripts/generate-tests.ts` | Accelerates test design from requirements; human review gate before CI inclusion |
| **LLM Failure Triage** | `scripts/triage.ts` | Classifies failures (real bug / flaky / locator drift / env issue) in CI; reduces manual triage time |
| **Playwright MCP** | `docs/mcp-setup.md` | Natural-language → browser action execution via Claude; accessibility-tree-driven |
| **Visual Regression** | `tests/visual/` | Screenshot baseline comparison; catches layout regressions missed by functional tests |
| **Accessibility Testing** | `tests/a11y/` | WCAG 2.1 AA checks via axe-core; regulatory requirement in UK financial services |

> **Every GenAI feature has a documented human-in-the-loop safeguard.** AI accelerates;
> QA judgement is the quality gate. See [docs/ai-in-qa.md](docs/ai-in-qa.md).

---

## Mapping to Banking / Insurance QA Experience

| Test Coverage | Maps to Real-World Experience |
|--------------|-------------------------------|
| Login / session management | FLEXCUBE authentication module; portal access control testing |
| Fund transfer (UI + API) | FLEXCUBE internal transfer module; GL debit/credit validation |
| Bill payment | FLEXCUBE outgoing payment; Royal London premium payment flows |
| Accounts overview | Account summary screen; balance reconciliation validation |
| API chained workflows | Postman collection chains I built for FLEXCUBE REST integration testing |
| Accessibility (WCAG 2.1 AA) | FCA-mandated accessibility requirements at Royal London |
| Visual regression | UI sign-off process for customer-facing portal releases |

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Language | TypeScript 5.6 / Node 22 |
| Test framework | Playwright Test 1.49 |
| Pattern | Page Object Model + typed fixtures |
| API testing | Playwright `APIRequestContext` (built-in) |
| Visual testing | Playwright `toHaveScreenshot` |
| Accessibility | `@axe-core/playwright` |
| AI / LLM | Anthropic SDK (`claude-sonnet-4-6`) |
| Reporting | Playwright HTML report + JSON |
| CI/CD | GitHub Actions (sharded parallel, 4 workers) |

---

## Project Structure

```
ai-banking-qa-portfolio/
├── tests/
│   ├── auth.setup.ts          # Shared auth state (login once, reuse across tests)
│   ├── ui/                    # Functional browser tests
│   │   ├── login.spec.ts
│   │   ├── dashboard.spec.ts
│   │   ├── transfer.spec.ts
│   │   ├── billpay.spec.ts
│   │   ├── register.spec.ts
│   │   └── ai-generated/      # LLM drafts, human-reviewed
│   ├── api/                   # REST API tests
│   ├── visual/                # Screenshot baselines
│   └── a11y/                  # Accessibility checks
├── pages/                     # Typed Page Object classes
├── fixtures/                  # Custom Playwright fixtures + test data
├── utils/
│   ├── llm-client.ts          # Anthropic SDK wrapper (shared by all GenAI features)
│   ├── self-heal.ts           # Self-healing locator utility
│   └── logger.ts
├── scripts/
│   ├── generate-tests.ts      # AI test generation from requirements
│   └── triage.ts              # CI failure classification
├── requirements/              # Plain-English user stories (input for AI gen)
├── docs/                      # Architecture, MCP setup, AI feature guide
└── .github/workflows/ci.yml   # Sharded CI pipeline
```

---

## Quick Start

### Prerequisites
- Node.js 20+
- Git

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_GITHUB_USERNAME/ai-banking-qa-portfolio.git
cd ai-banking-qa-portfolio

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install --with-deps

# 4. Configure environment
cp .env.example .env
# Edit .env — set PARABANK_USERNAME and PARABANK_PASSWORD
# (Use the public demo: john / demo — or register a free account at parabank.parasoft.com)
```

### Running Tests

```bash
# All tests (chromium, firefox, webkit, API, visual, a11y)
npm test

# UI tests only
npm run test:ui

# API tests only
npm run test:api

# Visual regression
npm run test:visual

# Accessibility checks
npm run test:a11y

# Headed mode (watch the browser)
npm run test:headed

# Debug a specific test
npm run test:debug -- --grep "TC-L-01"

# View HTML report
npm run test:report
```

### GenAI Features (requires ANTHROPIC_API_KEY in .env)

```bash
# Generate test cases from a requirements file
npm run generate-tests -- --req requirements/REQ-001-login.md

# Generate for all requirements
npm run generate-tests -- --all

# Run AI failure triage on last test results
npm run triage
```

> **Without an API key:** All core tests run normally. GenAI features log a
> warning and skip gracefully — zero test failures caused by missing LLM config.

---

## CI Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs:

1. **TypeScript type check** — fast gate, fails immediately on type errors
2. **Sharded test run** — 4 parallel runners, each executing 1/4 of the test suite
3. **Report merge** — combines shard results into a single HTML report artifact
4. **AI failure triage** — classifies failures and posts to the Actions job summary
5. **API-only job** — runs REST tests without browser install overhead

Artifacts retained per run:
- `playwright-report/` (HTML) — 30 days
- `test-results/*.zip` (traces) — 7 days (on failure only)
- `test-results/triage.json` — 14 days

---

## Screenshots

> *Screenshots will be added after first successful CI run*

| Login Page | Accounts Overview | Transfer Funds |
|-----------|------------------|----------------|
| *(screenshot placeholder)* | *(screenshot placeholder)* | *(screenshot placeholder)* |

| AI Triage Report | Playwright HTML Report |
|-----------------|----------------------|
| *(GitHub Actions job summary screenshot)* | *(HTML report screenshot)* |

---

## Security Notes

- **No credentials are committed to this repository.** Test accounts use the public ParaBank demo (`john/demo`) set via environment variables.
- **`.env` is gitignored.** Copy `.env.example` to `.env` locally — never commit `.env`.
- **API keys are GitHub Secrets** in CI (`ANTHROPIC_API_KEY`). The suite runs without them.
- **Storage state files** (`playwright/.auth/*.json`) are gitignored — they contain session tokens.
- No real banking credentials, PII, or production systems are used anywhere in this project.

---

## Documentation

| Document | Contents |
|---------|---------|
| [docs/architecture.md](docs/architecture.md) | System architecture with Mermaid diagram |
| [docs/ai-in-qa.md](docs/ai-in-qa.md) | Deep-dive on each GenAI feature + human oversight |
| [docs/mcp-setup.md](docs/mcp-setup.md) | Playwright MCP configuration for Claude |

---

## Author

**Neelima Gunduboina**  
ISTQB Certified | 4+ Years QA | Banking (FLEXCUBE) & Insurance (Royal London)  
*Positioning for AI-augmented QA roles in 2025*

---

## License

MIT — see [LICENSE](LICENSE)
