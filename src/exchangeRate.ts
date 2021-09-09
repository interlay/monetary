import Big, {RoundingMode} from "big.js";
import { Bitcoin, BitcoinUnit } from "./currencies";
import { InterBtc } from "./currencies/interbtc";
import { KBtc } from "./currencies/kbtc";
import { Currency, MonetaryAmount, UnitList } from "./monetary";

Big.DP = 100;

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
      rate = rate.div(new Big(10).pow(baseUnit));
    }
    if (counterUnit) {
      rate = rate.mul(new Big(10).pow(counterUnit));
    }
    return rate;
  }

  /**
   * Helper that takes a rate converting minimal units (e.g. Wei/Satoshi, for Bitcoin and
   * Ethereum) and returns the rate among arbitrary mixed-and-matched units
   * (i.e. ETH/Satoshi, Gwei/BTC, etc.)
   * Defaults to denormalizing to base units of the currencies (e.g. ETH/BTC).
   **/
  private denormalizeRate(
    rate: Big,
    { baseUnit, counterUnit }: Partial<UnitMap<BaseUnit, CounterUnit>>
  ) {
    if (baseUnit === undefined) baseUnit = this.base.base;
    if (counterUnit === undefined) counterUnit = this.counter.base;
    rate = rate
      .mul(new Big(10).pow(baseUnit))
      .div(new Big(10).pow(counterUnit));
    return rate;
  }

  /**
   *
   * @param base Base currency, BTC in BTC/USDT
   * @param counter Counter currency, USDT in BTC/USDT
   * @param rate Exchange rate: amount of `counter` needed per unit of `base`
   * @param baseUnit (optional) Unit of base currency which `rate` expresses. Defaults to the currency base unit.
   * E.g. "BTC" or "satoshi" in BTC/USDT, defaulting to BTC.
   * @param counterUnit (optional) Unit of counter currency which `rate` expresses. Defaults to the currency base unit.
   */
  constructor(
    readonly base: Base,
    readonly counter: Counter,
    readonly rate: Big,
    baseUnit: BaseUnit[keyof BaseUnit] = base.base,
    counterUnit: CounterUnit[keyof CounterUnit] = counter.base
  ) {
    this.rate = this.normalizeRate(rate, { baseUnit, counterUnit });
  }

  toBase(
    amount: MonetaryAmount<Counter, CounterUnit>
  ): MonetaryAmount<Base, BaseUnit> {
    const converted = amount.div(this.rate);
    return new MonetaryAmount(this.base, converted._rawAmount);
  }

  toCounter(
    amount: MonetaryAmount<Base, BaseUnit>
  ): MonetaryAmount<Counter, CounterUnit> {
    const converted = amount.mul(this.rate);
    return new MonetaryAmount(this.counter, converted._rawAmount);
  }

  toBig(units?: Partial<UnitMap<BaseUnit, CounterUnit>>): Big {
    return this.denormalizeRate(this.rate, units || {});
  }

  toRawBig(): Big {
    return this.toBig({ baseUnit: this.base.rawBase, counterUnit: this.counter.rawBase } as UnitMap<
      BaseUnit,
      CounterUnit
    >);
  }

  toString(
    units?: Partial<UnitMap<BaseUnit, CounterUnit>>,
    precision?: number,
    rm?: RoundingMode,
  ): string {
    let rate = this.denormalizeRate(this.rate, units || {});
    if (precision !== undefined) rate = rate.round(precision, rm);
    return rate.toString();
  }

  toRawString(): string {
    return this.toString({ baseUnit: 0, counterUnit: 0 } as UnitMap<
      BaseUnit,
      CounterUnit
    >);
  }

  toHuman(precision?: number): string {
    if (precision === undefined) {
      if (this.base.humanDecimals && this.counter.humanDecimals) {
        precision = Math.max(
          this.base.humanDecimals,
          this.counter.humanDecimals
        );
      } else if (this.base.humanDecimals !== undefined) {
        precision = this.base.humanDecimals;
      } else {
        precision = this.counter.humanDecimals;
      }
    }
    return this.toString(
      { baseUnit: this.base.base, counterUnit: this.counter.base },
      precision
    );
  }
}

const one = new Big(1);

export const BTC_INTERBTC = new ExchangeRate<Bitcoin, BitcoinUnit, InterBtc, BitcoinUnit>(
  Bitcoin,
  InterBtc,
  one
);

export const BTC_KBTC = new ExchangeRate<Bitcoin, BitcoinUnit, KBtc, BitcoinUnit>(
  Bitcoin,
  KBtc,
  one
);

export const INTERBTC_KBTC = new ExchangeRate<InterBtc, BitcoinUnit, KBtc, BitcoinUnit>(
  InterBtc,
  KBtc,
  one
);
