import Big from "big.js";
import { Currency, MonetaryAmount, UnitList } from "./monetary";

export type UnitMap<B extends UnitList, C extends UnitList> = {
  baseUnit: B[keyof B];
  counterUnit: C[keyof C];
};

export class ExchangeRate<
  Base extends Currency<BaseUnit>,
  BaseUnit extends UnitList,
  Counter extends Currency<CounterUnit>,
  CounterUnit extends UnitList
> {
  /**
   * Helper that takes a rate converting arbitrary units (e.g. Satoshi/ETH, BTC/Gwei, etc.)
   * and returns the base rate among minimal units (i.e. Satoshi/Wei, for Bitcoin and Ethereum)
   **/
  private normalizeRate(
    rate: Big,
    { baseUnit, counterUnit }: Partial<UnitMap<BaseUnit, CounterUnit>>
  ) {
    if (baseUnit) {
      rate = rate.mul(new Big(10).pow(baseUnit));
    }
    if (counterUnit) {
      rate = rate.div(new Big(10).pow(counterUnit));
    }
    return rate;
  }

  /**
   * Helper that takes a rate converting base units (e.g. Satoshi/Wei, for Bitcoin and
   * Ethereum) and returns the rate among arbitrary mixed-and-matched units
   * (i.e. Satoshi/ETH BTC/Gwei, etc.)
   **/
  private denormalizeRate(
    rate: Big,
    { baseUnit, counterUnit }: Partial<UnitMap<BaseUnit, CounterUnit>>
  ) {
    if (baseUnit) {
      rate = rate.div(new Big(10).pow(baseUnit));
    }
    if (counterUnit) {
      rate = rate.mul(new Big(10).pow(counterUnit));
    }
    return rate;
  }

  /**
   *
   * @param base Base currency, BTC in BTC/USDT
   * @param counter Counter currency, USDT in BTC/USDT
   * @param rate Exchange rate: amount of `counter` needed per unit of `base`
   * @param baseUnit (optional) Unit of base currency which `rate` expresses. Defaults to 0 (smallest unit).
   * E.g. "BTC" or "satoshi" in BTC/USDT, defaulting to satoshi.
   * @param counterUnit (optional) Unit of counter currency which `rate` expresses. Defaults to 0 (smallest unit).
   */
  constructor(
    readonly base: Base,
    readonly counter: Counter,
    readonly rate: Big,
    baseUnit?: BaseUnit[keyof BaseUnit],
    counterUnit?: CounterUnit[keyof CounterUnit]
  ) {
    this.rate = this.normalizeRate(rate, { baseUnit, counterUnit });
  }

  toBase(
    amount: MonetaryAmount<Counter, CounterUnit>
  ): MonetaryAmount<Base, BaseUnit> {
    const converted = amount.toBig().div(this.rate);
    return new MonetaryAmount(this.base, converted);
  }

  toCounter(
    amount: MonetaryAmount<Base, BaseUnit>
  ): MonetaryAmount<Counter, CounterUnit> {
    const converted = amount.toBig().mul(this.rate);
    return new MonetaryAmount(this.counter, converted);
  }

  toBig(units: Partial<UnitMap<BaseUnit, CounterUnit>>): Big {
    return this.denormalizeRate(this.rate, units);
  }

  toString(
    units: Partial<UnitMap<BaseUnit, CounterUnit>>,
    precision?: number
  ): string {
    const rate = this.denormalizeRate(this.rate, units);
    return rate.toFixed(precision);
  }
}
