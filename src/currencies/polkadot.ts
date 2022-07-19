import { BigSource } from "big.js";
import { Currency, MonetaryAmount } from "../monetary";

export const Polkadot: Currency = {
  name: "Polkadot",
  decimals: 10,
  humanDecimals: 5,
  ticker: "DOT",
} as const;
export type Polkadot = typeof Polkadot;

export class PolkadotAmount extends MonetaryAmount<Polkadot> {
  constructor(amount: BigSource) {
    super(Polkadot, amount);
  }
  withAmount(amount: BigSource): this {
    const Cls = this.constructor as new (amount: BigSource) => this;
    return new Cls(amount);
  }
  static zero = () => new PolkadotAmount(0);
}
