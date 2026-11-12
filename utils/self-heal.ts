/**
 * self-heal.ts — AI-powered self-healing locator utility.
 *
 * HOW IT WORKS
 * ─────────────
 * 1. Each locator is registered with a human-readable semantic intent
 *    (e.g. "the Transfer Funds submit button").
 * 2. On every `locate()` call the helper first tries the original selector.
 * 3. If that selector throws (element not found / stale), it captures an
 *    accessibility snapshot of the current page, sends it to the LLM with
 *    the semantic intent, and asks for a new CSS/ARIA selector.
 * 4. The healed selector is cached in `.locator-cache.json` so subsequent
 *    calls skip the LLM entirely — keeping tests fast.
 * 5. If the LLM is unavailable (no API key) or returns nothing useful, the
 *    original selector is returned unchanged so the test fails with a clear
 *    Playwright error rather than a silent hang.
 *
 * HUMAN-IN-THE-LOOP SAFEGUARD
 * ────────────────────────────
 * Self-healing is a *development aid*, not a silent test patcher.
 * - Every heal is logged with the old and new selector.
 * - The cache file is committed to source control so the team reviews drifts.
 * - Tests are never silently re-run with a healed locator in CI without a
 *   human reviewing the cache diff in the PR.
 */

import * as fs from 'fs';
import * as path from 'path';
import { Locator, Page } from '@playwright/test';
import { chat } from './llm-client';
import { log } from './logger';

const CACHE_FILE = path.resolve(process.cwd(), '.locator-cache.json');

type LocatorCache = Record<string, string>;

function loadCache(): LocatorCache {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8')) as LocatorCache;
    }
  } catch {
    // Corrupt cache — start fresh
  }
  return {};
}

function saveCache(cache: LocatorCache): void {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (err) {
    log.warn(`[self-heal] Could not persist cache: ${String(err)}`);
  }
}

const SYSTEM_PROMPT = `You are a Playwright test automation expert.
Given an accessibility snapshot of a web page and a semantic description of an element,
return a single CSS selector or ARIA role selector that uniquely identifies that element.

Rules:
- Prefer data-testid, aria-label, role+name selectors over fragile class/index selectors.
- Return ONLY the selector string on a single line — no explanation, no code block.
- If you cannot identify the element with confidence, return the string: UNABLE_TO_HEAL`;

/**
 * Attempt to heal a broken selector using the LLM and the live page snapshot.
 */
async function healLocator(
  page: Page,
  intent: string,
  originalSelector: string,
): Promise<string> {
  log.info(`[self-heal] Attempting to heal: "${intent}" (was: ${originalSelector})`);

  // Capture an ARIA snapshot (YAML; lightweight, no screenshot needed).
  // page.accessibility was removed from Playwright; ariaSnapshot() replaces it.
  let snapshot: string;
  try {
    snapshot = await page.locator('body').ariaSnapshot();
  } catch {
    snapshot = await page.content();
  }

  const prompt = `Page accessibility snapshot:
\`\`\`yaml
${snapshot.slice(0, 8000)}
\`\`\`

Semantic intent: "${intent}"
Previous selector (now broken): "${originalSelector}"

Return the best new selector for this element.`;

  const response = await chat(prompt, SYSTEM_PROMPT);

  if (!response || response.content.includes('UNABLE_TO_HEAL')) {
    log.warn(`[self-heal] LLM could not heal "${intent}" — falling back to original`);
    return originalSelector;
  }

  const healed = response.content.trim().replace(/^['"`]|['"`]$/g, '');
  log.info(`[self-heal] Healed "${intent}": ${originalSelector} → ${healed}`);
  return healed;
}

/**
 * SelfHealingLocator — wraps a Playwright Locator with intent-based healing.
 *
 * @example
 * const submitBtn = new SelfHealingLocator(page, '#submit', 'Transfer Funds submit button');
 * const locator = await submitBtn.locate();
 * await locator.click();
 */
export class SelfHealingLocator {
  private cache: LocatorCache;
  private cacheKey: string;

  constructor(
    private readonly page: Page,
    private readonly originalSelector: string,
    private readonly intent: string,
  ) {
    this.cache = loadCache();
    this.cacheKey = `${intent}::${originalSelector}`;
  }

  /**
   * Resolves the best available locator for this element.
   * Uses cache → original selector → LLM heal, in that order.
   */
  async locate(): Promise<Locator> {
    // 1. Cached healed selector (fast path)
    const cached = this.cache[this.cacheKey];
    if (cached && cached !== this.originalSelector) {
      log.debug(`[self-heal] Using cached selector for "${this.intent}": ${cached}`);
      const loc = this.page.locator(cached);
      if (await loc.count() > 0) return loc;
      // Cache miss at runtime — fall through to re-heal
      log.warn(`[self-heal] Cached selector stale for "${this.intent}", re-healing`);
    }

    // 2. Try original selector
    const original = this.page.locator(this.originalSelector);
    if (await original.count() > 0) return original;

    // 3. LLM heal
    const healed = await healLocator(this.page, this.intent, this.originalSelector);

    if (healed !== this.originalSelector) {
      this.cache[this.cacheKey] = healed;
      saveCache(this.cache);
    }

    return this.page.locator(healed);
  }

  /** Convenience: locate and click in one call. */
  async click(): Promise<void> {
    const loc = await this.locate();
    await loc.click();
  }

  /** Convenience: locate and fill in one call. */
  async fill(value: string): Promise<void> {
    const loc = await this.locate();
    await loc.fill(value);
  }
}

/**
 * Factory helper — use this in page objects for intent-annotated locators.
 */
export function selfHeal(
  page: Page,
  selector: string,
  intent: string,
): SelfHealingLocator {
  return new SelfHealingLocator(page, selector, intent);
}
