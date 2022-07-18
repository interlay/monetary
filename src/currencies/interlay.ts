import { BigSource } from "big.js";
import { Currency, MonetaryAmount } from "../monetary";

export const InterlayUnit = {
  INTR: 10,
  Planck: 0,
} as const;
export type InterlayUnit = typeof InterlayUnit;

export const Interlay: Currency = {
  name: "Interlay",
  decimals: 10,
  humanDecimals: 5,
  ticker: "INTR",
} as const;
export type Interlay = typeof Interlay;

export class InterlayAmount extends MonetaryAmount<Interlay> {
  constructor(amount: BigSource) {
    super(Interlay, amount);
  }
  withAmount(amount: BigSource): this {
    const Cls = this.constructor as new (amount: BigSource) => this;
    return new Cls(amount);
  }

  static zero = () => new InterlayAmount(0);
}
