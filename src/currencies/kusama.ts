import { BigSource } from "big.js";
import { Currency, MonetaryAmount } from "../monetary";

export const Kusama: Currency = {
  name: "Kusama",
  decimals: 12,
  humanDecimals: 5,
  ticker: "KSM",
} as const;
export type Kusama = typeof Kusama;

export class KusamaAmount extends MonetaryAmount<Kusama> {
  constructor(amount: number) {
    super(Kusama, amount);
  }

  withAmount(amount: BigSource): this {
    const Cls = this.constructor as new (amount: BigSource) => this;
    return new Cls(amount);
  }

  static zero = () => new KusamaAmount(0);
}
