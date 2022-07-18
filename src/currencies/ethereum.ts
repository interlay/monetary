import { BigSource } from "big.js";
import { Currency, MonetaryAmount } from "../monetary";

export const Ethereum: Currency = {
  name: "Ethereum",
  decimals: 18,
  ticker: "ETH",
  humanDecimals: 7,
} as const;
export type Ethereum = typeof Ethereum;

/* Example that extends the constructor to allow convenient `new EthereumAmount(amount)` calls */
export class EthereumAmount extends MonetaryAmount<Ethereum> {
  constructor(amount: number) {
    super(Ethereum, amount);
  }

  withAmount(amount: BigSource): this {
    const Cls = this.constructor as new (amount: BigSource) => this;
    return new Cls(amount);
  }

  static zero = () => new EthereumAmount(0);
}
