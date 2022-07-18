import Big, { RoundingMode } from "big.js";
import { Bitcoin, InterBtc, KBtc } from "./currencies";
import { Currency, MonetaryAmount } from "./monetary";

Big.DP = 100;

export class ExchangeRate<Base extends Currency, Counter extends Currency> {
  /**
   * Helper that takes a rate converting arbitrary units (e.g. Satoshi/ETH, BTC/Gwei, etc.)
   * and returns the base rate among minimal units (i.e. Satoshi/Wei, for Bitcoin and Ethereum)
   **/
  private normalizeRate(
    rate: Big,
    [baseDecimals, counterDecimals]: [number, number]
  ) {
    if (baseDecimals) {
      rate = rate.div(new Big(10).pow(baseDecimals));
    }
    if (counterDecimals) {
      rate = rate.mul(new Big(10).pow(counterDecimals));
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
    [baseDecimals, counterDecimals]: [number, number]
  ) {
    if (baseDecimals === undefined) baseDecimals = this.base.decimals;
    if (counterDecimals === undefined) counterDecimals = this.counter.decimals;
    rate = rate
      .mul(new Big(10).pow(baseDecimals))
      .div(new Big(10).pow(counterDecimals));
    return rate;
  }

  /**
   *
   * @param base Base currency, BTC in BTC/USDT
   * @param counter Counter currency, USDT in BTC/USDT
   * @param rate Exchange rate: amount of `counter` needed per unit of `base`
   * @param baseDecimals (optional) Unit of base currency decimals which `rate` expresses. Defaults to the currency decimals.
   * E.g. 8 for "BTC" or 0 for "satoshi" in BTC/USDT, defaulting to 8.
   * @param counterDecimals (optional) Unit of counter currency decimals which `rate` expresses. Defaults to the currency decimals.
   */
  constructor(
    readonly base: Base,
    readonly counter: Counter,
    readonly rate: Big,
    baseDecimals: number = base.decimals,
    counterDecimals: number = counter.decimals
  ) {
    this.rate = this.normalizeRate(rate, [baseDecimals, counterDecimals]);
  }

  toBase(amount: MonetaryAmount<Counter>): MonetaryAmount<Base> {
    const converted = amount.div(this.rate);
    return new MonetaryAmount(this.base, converted._rawAmount);
  }

  toCounter(amount: MonetaryAmount<Base>): MonetaryAmount<Counter> {
    const converted = amount.mul(this.rate);
    return new MonetaryAmount(this.counter, converted._rawAmount);
  }

  toBig(decimals?: [number, number]): Big {
    return this.denormalizeRate(
      this.rate,
      decimals || [this.base.decimals, this.counter.decimals]
    );
  }

  toRawBig(): Big {
    return this.toBig([0, 0]);
  }

  toString(
    decimals?: [number, number],
    precision?: number,
    rm?: RoundingMode
  ): string {
    let rate = this.denormalizeRate(
      this.rate,
      decimals || [this.base.decimals, this.counter.decimals]
    );
    if (precision !== undefined) rate = rate.round(precision, rm);
    return rate.toString();
  }

  toRawString(): string {
    return this.toString([0, 0]);
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
      [this.base.decimals, this.counter.decimals],
      precision
    );
  }
}

const one = new Big(1);

export const BTC_INTERBTC = new ExchangeRate<Bitcoin, InterBtc>(
  Bitcoin,
  InterBtc,
  one
);

export const BTC_KBTC = new ExchangeRate<Bitcoin, KBtc>(Bitcoin, KBtc, one);

export const INTERBTC_KBTC = new ExchangeRate<InterBtc, KBtc>(
  InterBtc,
  KBtc,
  one
);
