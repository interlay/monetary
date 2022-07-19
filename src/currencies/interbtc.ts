import { BigSource } from "big.js";
import { Currency, MonetaryAmount } from "../monetary";
import { Bitcoin } from "./bitcoin";

export const InterBtc: Currency = {
  ...Bitcoin,
  ticker: "IBTC",
} as const;
export type InterBtc = typeof InterBtc;

export class InterBtcAmount extends MonetaryAmount<InterBtc> {
  constructor(amount: BigSource) {
    super(InterBtc, amount);
  }
  withAmount(amount: BigSource): this {
    const Cls = this.constructor as new (amount: BigSource) => this;
    return new Cls(amount);
  }

  static zero = () => new InterBtcAmount(0);
}
