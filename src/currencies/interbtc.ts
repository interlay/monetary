import { Currency, generateFromConversions, MonetaryAmount } from "../monetary";
import { BitcoinCurrencyLiteral, BTCUnit } from "./bitcoin";

export const InterBTCCurrencyLiteral: Currency<BTCUnit> = {
    ...BitcoinCurrencyLiteral,
    ticker: "INTERBTC"
} as const;
export type InterBTC = typeof InterBTCCurrencyLiteral;

export class InterBTCAmount extends MonetaryAmount<InterBTC, BTCUnit> {
  static from = generateFromConversions(BitcoinCurrencyLiteral, BitcoinCurrencyLiteral.units);
  static zero = InterBTCAmount.from.BTC(0);
}
