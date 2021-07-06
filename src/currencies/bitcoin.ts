import { Currency, generateFromConversions, MonetaryAmount } from "../monetary";
import { CurrencyName, Ticker } from "./names";

/* Minimal currency definition */

const BTCUnit = {
  BTC: 8,
  Satoshi: 0,
} as const;
export type BTCUnit = typeof BTCUnit;

export const Bitcoin: Currency<typeof BTCUnit> = {
  name: CurrencyName.Bitcoin,
  base: BTCUnit.BTC,
  units: BTCUnit,
  humanDecimals: 5,
  ticker: Ticker.Bitcoin
} as const;
export type Bitcoin = typeof Bitcoin;

export class BTCAmount extends MonetaryAmount<Bitcoin, BTCUnit> {
  static from = generateFromConversions(Bitcoin, BTCUnit);
  static zero = BTCAmount.from.BTC(0);
}
