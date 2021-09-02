import { Currency, generateFromConversions, MonetaryAmount } from "../monetary";
import { Bitcoin, BTCUnit } from "./bitcoin";

export const InterBTC: Currency<BTCUnit> = {
    ...Bitcoin,
    ticker: "INTERBTC"
} as const;
export type InterBTC = typeof InterBTC;

export class InterBTCAmount extends MonetaryAmount<InterBTC, BTCUnit> {
  static from = generateFromConversions(Bitcoin, Bitcoin.units);
  static zero = InterBTCAmount.from.BTC(0);
}
