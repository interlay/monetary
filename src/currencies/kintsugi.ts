import { BigSource } from "big.js";
import { Currency, MonetaryAmount } from "../monetary";

export const Kintsugi: Currency = {
  name: "Kintsugi",
  decimals: 12,
  humanDecimals: 5,
  ticker: "KINT",
} as const;
export type Kintsugi = typeof Kintsugi;

export class KintsugiAmount extends MonetaryAmount<Kintsugi> {
  constructor(amount: BigSource) {
    super(Kintsugi, amount);
  }
  withAmount(amount: BigSource): this {
    const Cls = this.constructor as new (amount: BigSource) => this;
    return new Cls(amount);
  }

  static zero = () => new KintsugiAmount(0);
}
