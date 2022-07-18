import { Currency, MonetaryAmount } from "../monetary";

export const InterlayUnit = {
  INTR: 10,
  Planck: 0,
} as const;
export type InterlayUnit = typeof InterlayUnit;

export const Interlay: Currency = {
  name: "Interlay",
  decimals: 10,
  humanDecimals: 5,
  ticker: "INTR",
} as const;
export type Interlay = typeof Interlay;

export class InterlayAmount extends MonetaryAmount<Interlay> {
  static zero = () => new InterlayAmount(Interlay, 0);
}
