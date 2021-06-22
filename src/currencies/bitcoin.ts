import { Currency, generateFromConversions, MonetaryAmount } from "../monetary";

/* Minimal currency definition */

const BTCUnit = {
  BTC: 8,
  Satoshi: 0,
} as const;

export const Bitcoin: Currency<typeof BTCUnit> = {
  name: "Bitcoin",
  base: "BTC",
  units: BTCUnit,
} as const;

export class BTCAmount extends MonetaryAmount<typeof Bitcoin, typeof BTCUnit> {
  static from = generateFromConversions(Bitcoin, BTCUnit);
}
