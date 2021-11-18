import { BigSource } from "big.js";
import { Currency, generateFromConversions, MonetaryAmount } from "../monetary";

export const KusamaUnit = {
  KSM: 12,
  Planck: 0,
} as const;
export type KusamaUnit = typeof KusamaUnit;

export const Kusama: Currency<KusamaUnit> = {
  name: "Kusama",
  base: KusamaUnit.KSM,
  rawBase: KusamaUnit.Planck,
  units: KusamaUnit,
  humanDecimals: 5,
  ticker: "KSM"
} as const;
export type Kusama = typeof Kusama;

export class KusamaAmount extends MonetaryAmount<Kusama, KusamaUnit> {
  constructor(amount: BigSource, unit?: keyof KusamaUnit) {
    super(Kusama, amount, unit ? KusamaUnit[unit] : 0);
  }
  withAmount(amount: BigSource): this {
    const Cls = this.constructor as new (amount: BigSource) => this;
    return new Cls(amount);
  }
  static from = generateFromConversions(Kusama, KusamaUnit);
  static zero = KusamaAmount.from.KSM(0);
}
