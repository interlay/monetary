import { BigSource } from "big.js";
import { Interlay } from ".";
import { Currency, MonetaryAmount } from "../monetary";

export const VoteInterlay: Currency = {
  ...Interlay,
  ticker: "VINTR",
} as const;
export type VoteInterlay = typeof VoteInterlay;

export class VoteInterlayAmount extends MonetaryAmount<VoteInterlay> {
  constructor(amount: BigSource) {
    super(VoteInterlay, amount);
  }
  withAmount(amount: BigSource): this {
    const Cls = this.constructor as new (amount: BigSource) => this;
    return new Cls(amount);
  }

  static zero = () => new VoteInterlayAmount(0);
}
