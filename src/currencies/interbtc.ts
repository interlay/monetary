import { Currency, generateFromConversions, MonetaryAmount } from "../monetary";
import { Bitcoin, BTCUnit } from "./bitcoin";

export const interBTC: Currency<BTCUnit> = {
    ...Bitcoin,
    ticker: "INTERBTC"
} as const;
export type interBTC = typeof interBTC;

export class interBTCAmount extends MonetaryAmount<interBTC, BTCUnit> {
  static from = generateFromConversions(interBTC, Bitcoin.units);
  static zero = interBTCAmount.from.BTC(0);
}
