export const PRIVACY_URL = 'https://samayhuf-star.github.io/app-legal/2patti/privacy.html';
export const TERMS_URL = 'https://samayhuf-star.github.io/app-legal/2patti/terms.html';
export const SUPPORT_URL = 'https://samayhuf-star.github.io/app-legal/2patti/support.html';

/** Placeholders from spec section 11 (Q13), to tune after beta. */
export const STARTING_CHIPS = 25_000;
export const DAILY_BONUS_BASE = 2_000;
export const DAILY_BONUS_STEP = 500; // day 7 of a streak pays 5,000
export const DAILY_BONUS_MAX_STREAK = 7;
/**
 * Free refill (test): back to 5,000 when the balance is below the Silver minimum.
 * TODO(before release): test-only, remove before the App Store release.
 */
export const FREE_TOPUP_TO = 5_000;

export const CHIP_DISCLAIMER = 'Virtual chips only. No cash value and no cash-out. Chips cannot be withdrawn, sold or exchanged.';
export const AGE_NOTICE = '18+ only. For entertainment. No real-money gambling.';
