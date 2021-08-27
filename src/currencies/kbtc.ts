import { Currency, generateFromConversions, MonetaryAmount } from "../monetary";
import { BitcoinCurrencyLiteral, BTCUnit } from "./bitcoin";

export const KBTCCurrencyLiteral: Currency<BTCUnit> = {
    ...BitcoinCurrencyLiteral,
    ticker: "KBTC"
} as const;
export type KBTC = typeof KBTCCurrencyLiteral;

export class KBTCAmount extends MonetaryAmount<KBTC, BTCUnit> {
  static from = generateFromConversions(BitcoinCurrencyLiteral, BitcoinCurrencyLiteral.units);
  static zero = KBTCAmount.from.BTC(0);
}