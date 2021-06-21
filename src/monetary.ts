import Big, { RoundingMode } from "big.js";
import { BigSource } from "big.js";

export type UnitList = Record<string, number>;

export interface Currency<Units extends UnitList> {
  readonly name: string;
  readonly units: Units;
  readonly base: keyof Units;
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

export class ExchangeRate<
  Base extends Currency<BaseUnits>,
  BaseUnits extends UnitList,
  Counter extends Currency<CounterUnits>,
  CounterUnits extends UnitList
> {
  /**
   *
   * @param base Base currency, BTC in BTC/USDT
   * @param counter Counter currency, USDT in BTC/USDT
   * @param rate Exchange rate: amount of `counter` needed per unit of `base`
   *             The amount is expressed with the same number of decimals as `counter`
   */
  constructor(
    readonly base: Base,
    readonly counter: Counter,
    readonly rate: Big
  ) {}

  toBase(
    amount: MonetaryAmount<Counter, CounterUnits>
  ): MonetaryAmount<Base, BaseUnits> {
    const converted = amount
      .toBig(this.base.decimals + this.counter.decimals)
      .div(this.rate);
    return new MonetaryAmount(this.base, converted);
  }

  toCounter(
    amount: MonetaryAmount<Base, BaseUnits>
  ): MonetaryAmount<Counter, CounterUnits> {
    const converted = amount.toBig(0).mul(this.rate);
    return new MonetaryAmount(this.counter, converted);
  }

  format(decimals = 0, precision?: number): string {
    return this.rate.div(new Big(10).pow(decimals)).toFixed(precision);
  }

  formatHuman(precision?: number): string {
    const formatted = this.format(this.counter.decimals, precision);
    return parseFloat(formatted).toLocaleString();
  }
}
