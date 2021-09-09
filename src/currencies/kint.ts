import { BigSource } from "big.js";
import { Currency, generateFromConversions, MonetaryAmount } from "../monetary";

export const KintsugiUnit = {
  KINT: 12,
  Planck: 0,
} as const;
export type KintsugiUnit = typeof KintsugiUnit;

export const Kintsugi: Currency<KintsugiUnit> = {
  name: "Kintsugi",
  base: KintsugiUnit.KINT,
  rawBase: KintsugiUnit.Planck,
  units: KintsugiUnit,
  humanDecimals: 3,
  ticker: "KINT"
} as const;
export type Kintsugi = typeof Kintsugi;

export class KintsugiAmount extends MonetaryAmount<Kintsugi, KintsugiUnit> {
  constructor(amount: BigSource, unit?: keyof KintsugiUnit) {
    super(Kintsugi, amount, unit ? KintsugiUnit[unit] : 0);
  }
  withAmount(amount: BigSource): this {
    const Cls = this.constructor as new (amount: BigSource) => this;
    return new Cls(amount);
  }
  static from = generateFromConversions(Kintsugi, KintsugiUnit);
  static zero = KintsugiAmount.from.KINT(0);
}
