import { BigSource } from "big.js";
import { Currency, generateFromConversions, MonetaryAmount } from "../monetary";

export const DOTUnit = {
  DOT: 10,
  Planck: 0,
} as const;
export type DOTUnit = typeof DOTUnit;

export const Polkadot: Currency<DOTUnit> = {
  name: "Polkadot",
  base: DOTUnit.DOT,
  rawBase: DOTUnit.Planck,
  units: DOTUnit,
  humanDecimals: 3,
  ticker: "DOT"
} as const;
export type Polkadot = typeof Polkadot;

export class DOTAmount extends MonetaryAmount<Polkadot, DOTUnit> {
  constructor(amount: BigSource, unit?: keyof DOTUnit) {
    super(Polkadot, amount, unit ? DOTUnit[unit] : 0);
  }
  withAmount(amount: BigSource): this {
    const Cls = this.constructor as new (amount: BigSource) => this;
    return new Cls(amount);
  }
  static from = generateFromConversions(Polkadot, DOTUnit);
  static zero = DOTAmount.from.DOT(0);
}
