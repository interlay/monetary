import { BigSource } from "big.js";
import { Currency, generateFromConversions, MonetaryAmount } from "../monetary";

export const KINTUnit = {
  KINT: 12,
  Planck: 0,
} as const;
export type KINTUnit = typeof KINTUnit;

export const KINT: Currency<KINTUnit> = {
  name: "Kintsugi",
  base: KINTUnit.KINT,
  rawBase: KINTUnit.Planck,
  units: KINTUnit,
  humanDecimals: 3,
  ticker: "KINT"
} as const;
export type KINT = typeof KINT;

export class KINTAmount extends MonetaryAmount<KINT, KINTUnit> {
  constructor(amount: BigSource, unit?: keyof KINTUnit) {
    super(KINT, amount, unit ? KINTUnit[unit] : 0);
  }
  withAmount(amount: BigSource): this {
    const Cls = this.constructor as new (amount: BigSource) => this;
    return new Cls(amount);
  }
  static from = generateFromConversions(KINT, KINTUnit);
  static zero = KINTAmount.from.KINT(0);
}
