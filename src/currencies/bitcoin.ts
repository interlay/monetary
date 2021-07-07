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
  rawBase: BTCUnit.Satoshi,
  units: BTCUnit,
  humanDecimals: 5,
  ticker: "BTC"
} as const;
export type Bitcoin = typeof Bitcoin;

export class BTCAmount extends MonetaryAmount<Bitcoin, BTCUnit> {
  static from = generateFromConversions(Bitcoin, BTCUnit);
  static zero = BTCAmount.from.BTC(0);
}
