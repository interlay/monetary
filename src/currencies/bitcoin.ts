import { Currency, generateFromConversions, MonetaryAmount } from "../monetary";

/* Minimal currency definition */

export const BitcoinUnit = {
  BTC: 8,
  Satoshi: 0,
} as const;
export type BitcoinUnit = typeof BitcoinUnit;

export const Bitcoin: Currency<typeof BitcoinUnit> = {
  name: "Bitcoin",
  base: BitcoinUnit.BTC,
  rawBase: BitcoinUnit.Satoshi,
  units: BitcoinUnit,
  humanDecimals: 8,
  ticker: "BTC"
} as const;
export type Bitcoin = typeof Bitcoin;

export class BitcoinAmount extends MonetaryAmount<Bitcoin, BitcoinUnit> {
  static from = generateFromConversions(Bitcoin, BitcoinUnit);
  static zero = BitcoinAmount.from.BTC(0);
}
