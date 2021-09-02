import { Currency, generateFromConversions, MonetaryAmount } from "../monetary";
import { Bitcoin, BTCUnit } from "./bitcoin";

export const kBTC: Currency<BTCUnit> = {
    ...Bitcoin,
    ticker: "KBTC"
} as const;
export type kBTC = typeof kBTC;

export class kBTCAmount extends MonetaryAmount<kBTC, BTCUnit> {
  static from = generateFromConversions(Bitcoin, Bitcoin.units);
  static zero = kBTCAmount.from.BTC(0);
}
