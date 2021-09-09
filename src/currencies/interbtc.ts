import { Currency, generateFromConversions, MonetaryAmount } from "../monetary";
import { Bitcoin, BitcoinUnit } from "./bitcoin";

export const InterBtc: Currency<BitcoinUnit> = {
    ...Bitcoin,
    ticker: "INTERBTC"
} as const;
export type InterBtc = typeof InterBtc;

export class InterBtcAmount extends MonetaryAmount<InterBtc, BitcoinUnit> {
  static from = generateFromConversions(InterBtc, Bitcoin.units);
  static zero = InterBtcAmount.from.BTC(0);
}
