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

export const Ethereum: Currency<typeof ETHUnit> = {
  name: "Ethereum",
  units: ETHUnit,
  base: "ETH",
} as const;

/* Example that extends the constructor to allow convenient `new ETHAmount(amount)` calls */
export class ETHAmount extends MonetaryAmount<typeof Ethereum, typeof ETHUnit> {
  constructor(amount: BigSource, unit?: keyof typeof ETHUnit) {
    super(Ethereum, amount, unit ? ETHUnit[unit] : 0);
  }
  withAmount(amount: BigSource): this {
    const Cls = this.constructor as new (amount: BigSource) => this;
    return new Cls(amount);
  }
  static from = generateFromConversions(Ethereum, ETHUnit);
}

/* Extending Currency for more flexibility */
export interface ERC20<Units extends UnitList> extends Currency<Units> {
  address: string;
}

const TetherUnit = {
  Tether: 6,
} as const;

export class Tether implements ERC20<typeof TetherUnit> {
  constructor(readonly address: string) {}

  get units(): typeof TetherUnit {
    return TetherUnit;
  }
  get base(): keyof typeof TetherUnit {
    return "Tether";
  }
  get name(): string {
    return "Tether";
  }
}

export class TetherAmount extends MonetaryAmount<Tether, typeof TetherUnit> {
  static from = generateFromConversions(
    new Tether("0xdac17f958d2ee523a2206206994597c13d831ec7"),
    TetherUnit
  );
}
