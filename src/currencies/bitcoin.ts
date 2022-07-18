import { BigSource } from "big.js";
import { Currency, MonetaryAmount } from "../monetary";

/* Minimal currency definition */

export const Bitcoin: Currency = {
  name: "Bitcoin",
  decimals: 8,
  humanDecimals: 8,
  ticker: "BTC",
} as const;
export type Bitcoin = typeof Bitcoin;

export class BitcoinAmount extends MonetaryAmount<Bitcoin> {
  constructor(amount: number) {
    super(Bitcoin, amount);
  }

  withAmount(amount: BigSource): this {
    const Cls = this.constructor as new (amount: BigSource) => this;
    return new Cls(amount);
  }

  static zero = () => new BitcoinAmount(0);
}
