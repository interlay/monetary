import { BigSource } from "big.js";
import { Currency, MonetaryAmount } from "../monetary";
import { Bitcoin } from "./bitcoin";

export const KBtc: Currency = {
  ...Bitcoin,
  ticker: "KBTC",
} as const;
export type KBtc = typeof KBtc;

export class KBtcAmount extends MonetaryAmount<KBtc> {
  constructor(amount: BigSource) {
    super(KBtc, amount);
  }
  withAmount(amount: BigSource): this {
    const Cls = this.constructor as new (amount: BigSource) => this;
    return new Cls(amount);
  }

  static zero = () => new KBtcAmount(0);
}
