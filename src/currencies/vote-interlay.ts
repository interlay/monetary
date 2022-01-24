import { Interlay, InterlayUnit } from ".";
import { Currency, generateFromConversions, MonetaryAmount } from "../monetary";

export const VoteInterlay: Currency<InterlayUnit> = {
    ...Interlay,
    ticker: "VINTR"
} as const;
export type VoteInterlay = typeof VoteInterlay;

export class VoteInterlayAmount extends MonetaryAmount<VoteInterlay, InterlayUnit> {
  static from = generateFromConversions(VoteInterlay, Interlay.units);
  static zero = VoteInterlayAmount.from.INTR(0);
}
