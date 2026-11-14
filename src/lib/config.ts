export const PRIVACY_URL = 'https://samayhuf-star.github.io/app-legal/2patti/privacy.html';
export const TERMS_URL = 'https://samayhuf-star.github.io/app-legal/2patti/terms.html';
export const SUPPORT_URL = 'https://samayhuf-star.github.io/app-legal/2patti/support.html';

/** Starting stack is 25,000. Daily bonus is a flat 250, once per local day. */
export const STARTING_CHIPS = 25_000;
export const DAILY_BONUS = 250;

export const CHIP_DISCLAIMER = 'Virtual chips only. No cash value and no cash-out. Chips cannot be withdrawn, sold or exchanged.';
export const AGE_NOTICE = '18+ only. For entertainment. No real-money gambling.';

// Premium / IAP
export const ENTITLEMENT_ID = 'premium';
export const PRODUCT_ID_LIFETIME = 'twopatti_lifetime';

export const PRICING = {
  trialDays: 7,
  lifetimePrice: 39.99,
  lifetimeProductId: PRODUCT_ID_LIFETIME,
};

// RevenueCat keys (set via EAS env)
export const RC_API_KEY_IOS = process.env.EXPO_PUBLIC_RC_IOS_KEY ?? 'appl_REPLACE_ME';
export const RC_API_KEY_ANDROID = process.env.EXPO_PUBLIC_RC_ANDROID_KEY ?? 'goog_REPLACE_ME';
