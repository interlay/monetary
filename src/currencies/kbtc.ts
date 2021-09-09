import { Currency, generateFromConversions, MonetaryAmount } from "../monetary";
import { Bitcoin, BitcoinUnit } from "./bitcoin";

export const KBtc: Currency<BitcoinUnit> = {
    ...Bitcoin,
    ticker: "KBTC"
} as const;
export type KBtc = typeof KBtc;

export class KBtcAmount extends MonetaryAmount<KBtc, BitcoinUnit> {
  static from = generateFromConversions(KBtc, Bitcoin.units);
  static zero = KBtcAmount.from.BTC(0);
}
