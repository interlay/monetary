import { Currency, generateFromConversions, MonetaryAmount } from "../monetary";
import { Bitcoin, BTCUnit } from "./bitcoin";

export const KBTC: Currency<BTCUnit> = {
    ...Bitcoin,
    ticker: "KBTC"
} as const;
export type KBTC = typeof KBTC;

export class KBTCAmount extends MonetaryAmount<KBTC, BTCUnit> {
  static from = generateFromConversions(Bitcoin, Bitcoin.units);
  static zero = KBTCAmount.from.BTC(0);
}