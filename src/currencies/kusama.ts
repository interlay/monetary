import { BigSource } from "big.js";
import { Currency, generateFromConversions, MonetaryAmount } from "../monetary";

export const KSMUnit = {
  KSM: 12,
  Planck: 0,
} as const;
export type KSMUnit = typeof KSMUnit;

export const Kusama: Currency<KSMUnit> = {
  name: "Kusama",
  base: KSMUnit.KSM,
  rawBase: KSMUnit.Planck,
  units: KSMUnit,
  humanDecimals: 3,
  ticker: "KSM"
} as const;
export type Kusama = typeof Kusama;

export class KSMAmount extends MonetaryAmount<Kusama, KSMUnit> {
  constructor(amount: BigSource, unit?: keyof KSMUnit) {
    super(Kusama, amount, unit ? KSMUnit[unit] : 0);
  }
  withAmount(amount: BigSource): this {
    const Cls = this.constructor as new (amount: BigSource) => this;
    return new Cls(amount);
  }
  static from = generateFromConversions(Kusama, KSMUnit);
  static zero = KSMAmount.from.KSM(0);
}
