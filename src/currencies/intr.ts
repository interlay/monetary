import { BigSource } from "big.js";
import { Currency, generateFromConversions, MonetaryAmount } from "../monetary";

export const INTRUnit = {
  INTR: 10,
  Planck: 0,
} as const;
export type INTRUnit = typeof INTRUnit;

export const INTR: Currency<INTRUnit> = {
  name: "Interlay",
  base: INTRUnit.INTR,
  rawBase: INTRUnit.Planck,
  units: INTRUnit,
  humanDecimals: 3,
  ticker: "INTR"
} as const;
export type INTR = typeof INTR;

export class INTRAmount extends MonetaryAmount<INTR, INTRUnit> {
  constructor(amount: BigSource, unit?: keyof INTRUnit) {
    super(INTR, amount, unit ? INTRUnit[unit] : 0);
  }
  withAmount(amount: BigSource): this {
    const Cls = this.constructor as new (amount: BigSource) => this;
    return new Cls(amount);
  }
  static from = generateFromConversions(INTR, INTRUnit);
  static zero = INTRAmount.from.INTR(0);
}
