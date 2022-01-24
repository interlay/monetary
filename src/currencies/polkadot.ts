import { BigSource } from "big.js";
import { Currency, generateFromConversions, MonetaryAmount } from "../monetary";

export const PolkadotUnit = {
  DOT: 10,
  Planck: 0,
} as const;
export type PolkadotUnit = typeof PolkadotUnit;

export const Polkadot: Currency<PolkadotUnit> = {
  name: "Polkadot",
  base: PolkadotUnit.DOT,
  rawBase: PolkadotUnit.Planck,
  units: PolkadotUnit,
  humanDecimals: 5,
  ticker: "DOT"
} as const;
export type Polkadot = typeof Polkadot;

export class PolkadotAmount extends MonetaryAmount<Polkadot, PolkadotUnit> {
  constructor(amount: BigSource, unit?: keyof PolkadotUnit) {
    super(Polkadot, amount, unit ? PolkadotUnit[unit] : 0);
  }
  withAmount(amount: BigSource): this {
    const Cls = this.constructor as new (amount: BigSource) => this;
    return new Cls(amount);
  }
  static from = generateFromConversions(Polkadot, PolkadotUnit);
  static zero = PolkadotAmount.from.DOT(0);
}
