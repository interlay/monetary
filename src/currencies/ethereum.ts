import { BigSource } from "big.js";
import {
  Currency,
  generateFromConversions,
  MonetaryAmount,
  UnitList,
} from "../monetary";

const ETHUnit = {
  ETH: 18,
  GWei: 9,
  Wei: 0,
} as const;
export type ETHUnit = typeof ETHUnit;
export const EthereumCurrencyLiteral: Currency<typeof ETHUnit> = {
  name: "Ethereum",
  units: ETHUnit,
  base: ETHUnit.ETH,
  rawBase: ETHUnit.Wei,
  ticker: "ETH"
} as const;
export type Ethereum = typeof EthereumCurrencyLiteral;

/* Example that extends the constructor to allow convenient `new ETHAmount(amount)` calls */
export class ETHAmount extends MonetaryAmount<Ethereum, ETHUnit> {
  constructor(amount: BigSource, unit?: keyof ETHUnit) {
    super(EthereumCurrencyLiteral, amount, unit ? ETHUnit[unit] : 0);
  }
  withAmount(amount: BigSource): this {
    const Cls = this.constructor as new (amount: BigSource) => this;
    return new Cls(amount);
  }
  static from = generateFromConversions(EthereumCurrencyLiteral, ETHUnit);
  static zero = ETHAmount.from.ETH(0);
}

/* Extending Currency for more flexibility */
export interface ERC20<Units extends UnitList> extends Currency<Units> {
  address: string;
}

const TetherUnit = {
  Tether: 6,
  Raw: 0
} as const;
export type TetherUnit = typeof TetherUnit;
export class Tether implements ERC20<TetherUnit> {
  constructor(readonly address: string) {}

  get units(): TetherUnit {
    return TetherUnit;
  }
  get base(): TetherUnit[keyof TetherUnit] {
    return TetherUnit.Tether;
  }
  get rawBase(): TetherUnit[keyof TetherUnit] {
    return TetherUnit.Raw;
  }
  get name(): string {
    return "Tether";
  }
  get ticker(): string {
    return "USDT";
  }
}

export class TetherAmount extends MonetaryAmount<Tether, typeof TetherUnit> {
  static from = generateFromConversions(
    new Tether("0xdac17f958d2ee523a2206206994597c13d831ec7"),
    TetherUnit
  );
}
