import { BigSource } from "big.js";
import {
  Currency,
  generateFromConversions,
  MonetaryAmount
} from "../monetary";

const UsdcUnit = {
  USDC: 6,
  Raw: 0,
} as const;
export type UsdcUnit = typeof UsdcUnit;

export const Usdc: Currency<UsdcUnit> = {
  name: "USD Coin",
  base: UsdcUnit.USDC,
  rawBase: UsdcUnit.Raw,
  units: UsdcUnit,
  humanDecimals: 6,
  ticker: "USDC"
} as const;
export type Usdc = typeof Usdc;

export class UsdcAmount extends MonetaryAmount<Usdc, UsdcUnit> {
  constructor(amount: BigSource, unit?: keyof UsdcUnit) {
    super(Usdc, amount, unit ? UsdcUnit[unit] : 0);
  }
  withAmount(amount: BigSource): this {
    const Cls = this.constructor as new (amount: BigSource) => this;
    return new Cls(amount);
  }

  static from = generateFromConversions(Usdc, Usdc.units);
  static zero = UsdcAmount.from.USDC(0);
}
