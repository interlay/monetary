import { BigSource } from "big.js";
import { Kintsugi } from ".";
import { Currency, MonetaryAmount } from "../monetary";

export const VoteKintsugi: Currency = {
  ...Kintsugi,
  ticker: "VKINT",
} as const;
export type VoteKintsugi = typeof VoteKintsugi;

export class VoteKintsugiAmount extends MonetaryAmount<VoteKintsugi> {
  constructor(amount: BigSource) {
    super(VoteKintsugi, amount);
  }
  withAmount(amount: BigSource): this {
    const Cls = this.constructor as new (amount: BigSource) => this;
    return new Cls(amount);
  }

  static zero = () => new VoteKintsugiAmount(0);
}
