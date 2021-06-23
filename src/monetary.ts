import Big, { RoundingMode } from "big.js";
import { BigSource } from "big.js";

Big.DP = 100;

export type UnitList = Record<string, number>;

export interface Currency<Units extends UnitList> {
  readonly name: string;
  readonly units: Units;
  readonly base: Units[keyof Units];
  readonly humanDecimals?: number;
}

type toConversions<U extends UnitList> = { [key in keyof U]: () => Big };
type strConversions<U extends UnitList> = { [key in keyof U]: () => string };
type fromConversions<
  M extends MonetaryAmount<C, U>,
  C extends Currency<U>,
  U extends UnitList
> = { [key in keyof U]: (amount: BigSource) => M };

export class MonetaryAmount<C extends Currency<U>, U extends UnitList> {
  protected _amount: Big; // stored with 0 decimals internally

  constructor(
    readonly currency: C,
    amount: BigSource,
    unit: U[keyof U] = 0 as U[keyof U]
  ) {
    amount = new Big(amount).mul(new Big(10).pow(unit)); // convert to min denomination
    amount = amount.round(0); // then ensure no extraneous decimal places
    this._amount = amount;
  }

  toString(unit?: U[keyof U]): string {
    return this.toBig(unit).toString();
  }

  toBig(unit: U[keyof U] = 0 as U[keyof U], rm?: RoundingMode): Big {
    const ret = this._amount.div(new Big(10).pow(unit));
    return ret.round(unit, rm); // ensure no decimal places lower than smallest unit
  }

  toHuman(decimals: number | undefined = this.currency.humanDecimals): string {
    let big = this.toBig(this.currency.base);
    if (decimals !== undefined) big = big.round(decimals);
    return big.toString();
  }

  eq(amount: this): boolean {
    return this._amount.eq(amount._amount);
  }

  add(amount: this): this {
    if (!this.isSameCurrency(amount)) {
      throw new Error(
        `cannot add ${this.currency.name} and ${amount.currency.name}`
      );
    }
    return this.withAmount(this._amount.add(amount._amount));
  }

  sub(amount: this): this {
    if (!this.isSameCurrency(amount)) {
      throw new Error(
        `cannot subtract ${this.currency.name} and ${amount.currency.name}`
      );
    }
    return this.withAmount(this._amount.sub(amount._amount));
  }

  protected isSameCurrency(amount: this): boolean {
    return this.currency.name === amount.currency.name;
  }

  mul(multiplier: BigSource): this {
    return this.withAmount(this._amount.mul(multiplier));
  }

  div(divisor: BigSource): this {
    return this.withAmount(this._amount.div(divisor));
  }

  // NOTE: needs override if constructor is overriden
  withAmount(amount: BigSource, unit?: U[keyof U]): this {
    const Cls = this.constructor as new (
      currency: Currency<U>,
      amount: BigSource,
      unit?: U[keyof U]
    ) => this;
    return new Cls(this.currency, amount, unit);
  }

  to: toConversions<U> = (() =>
    Object.fromEntries(
      Object.entries(this.currency.units).map(([name, decimals]) => [
        name,
        () => this.toBig(decimals as U[keyof U]),
      ])
    ) as toConversions<U>)();

  str: strConversions<U> = (() =>
    Object.fromEntries(
      Object.entries(this.currency.units).map(([name, decimals]) => [
        name,
        () => this.toString(decimals as U[keyof U]),
      ])
    ) as strConversions<U>)();
}

export function generateFromConversions<
  M extends MonetaryAmount<C, U>,
  C extends Currency<U>,
  U extends UnitList
>(currency: C, units: U): fromConversions<M, C, U> {
  return Object.fromEntries(
    Object.entries(units).map(([name, decimals]) => [
      name,
      (amount: BigSource) =>
        new MonetaryAmount<C, U>(currency, amount, decimals as U[keyof U]) as M,
    ])
  ) as fromConversions<M, C, U>;
}
