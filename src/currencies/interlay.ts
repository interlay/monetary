import { BigSource } from "big.js";
import { Currency, generateFromConversions, MonetaryAmount } from "../monetary";

export const InterlayUnit = {
  RawBase: 10,
  Base: 0,
} as const;
export type InterlayUnit = typeof InterlayUnit;

export const Interlay: Currency<InterlayUnit> = {
  name: "Interlay",
  base: InterlayUnit.Base,
  rawBase: InterlayUnit.RawBase,
  units: InterlayUnit,
  humanDecimals: 3,
  ticker: "INTR"
} as const;
export type Interlay = typeof Interlay;

export class InterlayAmount extends MonetaryAmount<Interlay, InterlayUnit> {
  constructor(amount: BigSource, unit?: keyof InterlayUnit) {
    super(Interlay, amount, unit ? InterlayUnit[unit] : 0);
  }
  withAmount(amount: BigSource): this {
    const Cls = this.constructor as new (amount: BigSource) => this;
    return new Cls(amount);
  }
  static from = generateFromConversions(Interlay, InterlayUnit);
  static zero = InterlayAmount.from.RawBase(0);
}
