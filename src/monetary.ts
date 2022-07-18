import Big, { RoundingMode, BigSource } from "big.js";

Big.DP = 100;
Big.NE = -20;
Big.PE = 20;

export interface Currency {
  readonly name: string;
  readonly decimals: number;
  readonly ticker: string;
  readonly humanDecimals?: number;
}

export class MonetaryAmount<C extends Currency> {
  protected _amount: Big; // stored internally at minimal unit (0 DP), but arbitrary precision
  public rm: RoundingMode = RoundingMode.RoundDown;

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

  constructor(readonly currency: C, amount: BigSource) {
    amount = new Big(amount).mul(new Big(10).pow(currency.decimals)); // convert to atomic denomination
    this._amount = amount;
  }

  toString(atomic?: boolean, rm?: RoundingMode): string {
    return this.toBig(atomic ? 0 : this.currency.decimals, rm).toString();
  }

  toBig(unit: number = this.currency.decimals, rm?: RoundingMode): Big {
    const ret =
      unit == 0 ? this._amount : this._amount.div(new Big(10).pow(unit));
    return ret.round(unit, rm === undefined ? this.rm : rm); // ensure no decimal places lower than smallest unit
  }

  toHuman(decimals: number | undefined = this.currency.humanDecimals): string {
    const big = this.toBig(this.currency.decimals);
    let rounded: string;
    if (decimals !== undefined) {
      rounded =
        big.e >= -decimals
          ? big.round(decimals, this.rm).toString()
          : big.toPrecision(1, this.rm); // show at least 1 significant digit if rounding would give '0'
    } else rounded = big.toString();
    return rounded;
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
    return this.withAtomicAmount(this._amount.add(amount._amount));
  }

  sub(amount: this): this {
    this.ensureSameCurrency(amount, "subtraction");
    return this.withAtomicAmount(this._amount.sub(amount._amount));
  }

  isZero(): boolean {
    return this._amount.eq(new Big(0));
  }

  protected isSameCurrency(amount: this): boolean {
    return this.currency.name === amount.currency.name;
  }

  mul(multiplier: BigSource): this {
    return this.withAtomicAmount(this._amount.mul(multiplier));
  }

  div(divisor: BigSource): this {
    return this.withAtomicAmount(this._amount.div(divisor));
  }

  min(amount: this): this {
    return this.lt(amount) ? this : amount;
  }

  max(amount: this): this {
    return this.gt(amount) ? this : amount;
  }

  // NOTE: needs override if constructor is overriden
  withAmount(amount: BigSource): this {
    const Cls = this.constructor as new (
      currency: Currency,
      amount: BigSource
    ) => this;
    return new Cls(this.currency, amount);
  }

  // NOTE: may need override if withAmount signature is overriden
  withAtomicAmount(amount: BigSource): this {
    const baseAmount = new Big(amount).div(
      new Big(10).pow(this.currency.decimals)
    );
    return this.withAmount(baseAmount);
  }
}
