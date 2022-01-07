import { Kintsugi, KintsugiUnit } from ".";
import { Currency, generateFromConversions, MonetaryAmount } from "../monetary";

export const VoteKintsugi: Currency<KintsugiUnit> = {
    ...Kintsugi,
    ticker: "VKINT"
} as const;
export type VoteKintsugi = typeof VoteKintsugi;

export class VoteKintsugiAmount extends MonetaryAmount<VoteKintsugi, KintsugiUnit> {
  static from = generateFromConversions(VoteKintsugi, Kintsugi.units);
  static zero = VoteKintsugiAmount.from.KINT(0);
}
