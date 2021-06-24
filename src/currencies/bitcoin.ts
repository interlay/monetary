import { Currency, generateFromConversions, MonetaryAmount } from "../monetary";

/* Minimal currency definition */

const BTCUnit = {
  BTC: 8,
  Satoshi: 0,
} as const;
export type BTCUnit = typeof BTCUnit;

export const Bitcoin: Currency<typeof BTCUnit> = {
  name: "Bitcoin",
  base: BTCUnit.BTC,
  units: BTCUnit,
  humanDecimals: 5,
} as const;
export type Bitcoin = typeof Bitcoin;

export class BTCAmount extends MonetaryAmount<typeof Bitcoin, typeof BTCUnit> {
  static from = generateFromConversions(Bitcoin, BTCUnit);
}
