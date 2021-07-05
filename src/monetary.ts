import Big, { RoundingMode, BigSource } from "big.js";

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
  protected _amount: Big; // stored internally at minimal unit (0 DP), but arbitrary precision
  public rm: RoundingMode = RoundingMode.RoundHalfUp;

  /**
   * Accessor for the arbitrary precision internal storage.
   * May hold fractional amounts below the lowest currency unit (e.g. fractional Satoshi).
   **/
  get _rawAmount() {
    return this._amount;
  }

  private _integerAmount(rm?: RoundingMode): Big {
    if (rm === undefined) rm = this.rm;
    return this._amount.round(0, rm);
  }

  constructor(
    readonly currency: C,
    amount: BigSource,
    unit: U[keyof U] = 0 as U[keyof U]
  ) {
    amount = new Big(amount).mul(new Big(10).pow(unit)); // convert to min denomination
    this._amount = amount;
  }

  toString(unit?: U[keyof U], rm?: RoundingMode): string {
    return this.toBig(unit, rm).toString();
  }

  toBig(unit: U[keyof U] = 0 as U[keyof U], rm?: RoundingMode): Big {
    const ret = this._amount.div(new Big(10).pow(unit));
    return ret.round(unit, rm === undefined? this.rm : rm); // ensure no decimal places lower than smallest unit
  }

  toHuman(decimals: number | undefined = this.currency.humanDecimals): string {
    let big = this.toBig(this.currency.base);
    if (decimals !== undefined) big = big.round(decimals);
    return big.toString();
  }

  private parseCmpMembers(lhs: this, rhs: this, rm?: RoundingMode): [Big, Big] {
    return [lhs._integerAmount(rm), rhs._integerAmount(rm)];
  }

  private ensureSameCurrency(counterpart: this, opName = "operation") {
    if (!this.isSameCurrency(counterpart)) {
      throw new Error(
        `cannot perform ${opName} on ${this.currency.name} and ${counterpart.currency.name}`
      );
    }
  }

  eq(amount: this, rm?: RoundingMode): boolean {
    this.ensureSameCurrency(amount, "equality comparison");
    const [lhs, rhs] = this.parseCmpMembers(this, amount, rm);
    return lhs.eq(rhs);
  }

  gt(amount: this, rm?: RoundingMode): boolean {
    this.ensureSameCurrency(amount, "comparison");
    const [lhs, rhs] = this.parseCmpMembers(this, amount, rm);
    return lhs.gt(rhs);
  }

  gte(amount: this, rm?: RoundingMode): boolean {
    this.ensureSameCurrency(amount, "comparison");
    const [lhs, rhs] = this.parseCmpMembers(this, amount, rm);
    return lhs.gte(rhs);
  }

  lt(amount: this, rm?: RoundingMode): boolean {
    this.ensureSameCurrency(amount, "comparison");
    const [lhs, rhs] = this.parseCmpMembers(this, amount, rm);
    return lhs.lt(rhs);
  }

  lte(amount: this, rm?: RoundingMode): boolean {
    this.ensureSameCurrency(amount, "comparison");
    const [lhs, rhs] = this.parseCmpMembers(this, amount, rm);
    return lhs.lte(rhs);
  }

  add(amount: this): this {
    this.ensureSameCurrency(amount, "addition");
    return this.withAmount(this._amount.add(amount._amount));
  }

  sub(amount: this): this {
    this.ensureSameCurrency(amount, "subtraction");
    return this.withAmount(this._amount.sub(amount._amount));
  }

  isZero(): boolean {
    return this._amount === new Big(0);
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
