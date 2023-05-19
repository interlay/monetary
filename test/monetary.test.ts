import Big, { BigSource, RoundingMode } from "big.js";
import { expect } from "chai";
import * as fc from "fast-check";
import { Polkadot } from "../src/currencies";

import { Currency, MonetaryAmount } from "../src/monetary";

const fcBig = ({
  min,
  max,
}: { min?: number; max?: number } = {}): fc.Arbitrary<Big> =>
  fc
    .double({ next: true, min, max, noDefaultInfinity: true, noNaN: true })
    .map((v) => new Big(v));

const fcIntAsBig = ({
  min,
  max,
}: { min?: number; max?: number } = {}): fc.Arbitrary<Big> =>
  fc.integer({ min, max }).map((v) => new Big(v));

const fcDouble = (): fc.Arbitrary<number> =>
  fc.double({ next: true, noDefaultInfinity: true, noNaN: true });

const DummyUnit = {
  Base: 10,
  Intermediate: 5,
  Integer: 0,
} as const;
export type DummyUnit = typeof DummyUnit;
export const DummyCurrency: Currency = {
  name: "Dummy",
  decimals: DummyUnit.Base,
  ticker: "DUM",
  humanDecimals: 3,
} as const;
export type DummyCurrency = typeof DummyCurrency;

export class DummyAmount extends MonetaryAmount<DummyCurrency> {
  constructor(amount: BigSource) {
    super(DummyCurrency, amount);
  }
  withAmount(amount: BigSource): this {
    const Cls = this.constructor as new (amount: BigSource) => this;
    return new Cls(amount);
  }

  static fromAtomic = (amount: BigSource): DummyAmount => {
    const divisor = new Big(10).pow(DummyCurrency.decimals);
    const finalAmount = new Big(amount).div(divisor);
    return new DummyAmount(finalAmount);
  };
}

function scaleBig(big: Big, decimals: number) {
  return big.mul(new Big(10).pow(decimals));
}

describe("MonetaryAmount", () => {
  describe("Constructor and toString", () => {
    it("should use currency decimals unit by default", () => {
      fc.assert(
        fc.property(fcBig(), (currencyAmount) => {
          const amount = new DummyAmount(currencyAmount);
          expect(amount.toString()).to.eq(
            currencyAmount
              .round(DummyCurrency.decimals, RoundingMode.RoundDown)
              .toString()
          );
        })
      );
    });

    it("should show full amount or scientific notation as expected", () => {
      // expected cutoff is 39
      const above = Big(1e39);
      const below = above.sub(1);

      const amountAbove = new MonetaryAmount(Polkadot, 0).withAtomicAmount(
        above
      );
      const amountBelow = new MonetaryAmount(Polkadot, 0).withAtomicAmount(
        below
      );

      expect(amountAbove.toString(true)).to.eq("1e+39");

      // 39 times the '9' character
      const expectedBelow = "9".repeat(39);
      expect(amountBelow.toString(true)).to.eq(expectedBelow);
    });
  });

  describe("toHuman", () => {
    it("should format to base unit with default decimals", () => {
      fc.assert(
        fc.property(
          fcBig().filter(
            (big) =>
              big.div(new Big(10).pow(DummyCurrency.decimals)).e >
              -(DummyCurrency.humanDecimals || 100)
          ),
          (rawAmount) => {
            const amount = DummyAmount.fromAtomic(rawAmount);
            const scaled = amount
              .toBig(DummyCurrency.decimals)
              .round(DummyCurrency.humanDecimals, RoundingMode.RoundDown)
              .toString();
            expect(amount.toHuman()).to.eq(scaled);
          }
        )
      );
    });

    it("should leave at least 1 significant digit if rounding gives 0", () => {
      fc.assert(
        fc.property(fcBig({ min: -0.001, max: 0.001 }), (rawAmount) => {
          const amount = DummyAmount.fromAtomic(rawAmount);
          const scaled = amount.toBig(DummyCurrency.decimals).toPrecision(1);
          expect(amount.toHuman()).to.eq(scaled);
        })
      );
    });

    it("should format to decimals unit with custom decimals", () => {
      fc.assert(
        fc.property(
          fcBig(),
          fc.integer(-1e6, 1e6), // big.js decimal place limits
          (rawAmount, decimals) => {
            const amount = new DummyAmount(rawAmount);
            const base = amount.toBig(DummyCurrency.decimals);
            const scaled =
              base.e >= -decimals
                ? base.round(decimals, RoundingMode.RoundDown).toString()
                : base.toPrecision(1, RoundingMode.RoundDown);
            expect(amount.toHuman(decimals)).to.eq(scaled);
          }
        )
      );
    });
  });

  describe("toBig", () => {
    it("should return smallest unit by default", () => {
      fc.assert(
        fc.property(fcBig(), (rawAmount) => {
          const amount = new DummyAmount(rawAmount);
          expect(amount.toBig().eq(rawAmount));
        })
      );
    });

    it("should convert to other units", () => {
      fc.assert(
        fc.property(fcBig(), (rawAmount) => {
          Object.entries(DummyUnit).map(([_unit, decimals]) => {
            const amount = new DummyAmount(rawAmount);
            const unitAmount = scaleBig(rawAmount, -decimals);
            expect(amount.toBig(decimals).eq(unitAmount));
          });
        })
      );
    });
  });

  describe("arithmetic", () => {
    describe("eq", () => {
      it("should equal when amounts are equal", () => {
        fc.assert(
          fc.property(fcBig(), (rawAmount) => {
            const amountA = DummyAmount.fromAtomic(rawAmount);
            const amountB = DummyAmount.fromAtomic(rawAmount);
            expect(amountA.eq(amountB));
          })
        );
      });
    });

    describe("min", () => {
      it("should compute the minimum", () => {
        fc.assert(
          fc.property(fcIntAsBig(), fcIntAsBig(), (rawAmountA, rawAmountB) => {
            const amountA = DummyAmount.fromAtomic(rawAmountA);
            const amountB = DummyAmount.fromAtomic(rawAmountB);
            const min = amountA.min(amountB);
            expect(min.add(min).lte(amountA.add(amountB))).to.be.true;
          })
        );
      });
    });

    describe("max", () => {
      it("should compute the maximum", () => {
        fc.assert(
          fc.property(fcIntAsBig(), fcIntAsBig(), (rawAmountA, rawAmountB) => {
            const amountA = DummyAmount.fromAtomic(rawAmountA);
            const amountB = DummyAmount.fromAtomic(rawAmountB);
            const max = amountA.max(amountB);
            expect(max.add(max).gte(amountA.add(amountB))).to.be.true;
          })
        );
      });
    });

    describe("add", () => {
      it("should add and create new value", () => {
        fc.assert(
          fc.property(fcIntAsBig(), fcIntAsBig(), (rawAmountA, rawAmountB) => {
            const rawAmountAdded = rawAmountA.add(rawAmountB);
            const amountA = DummyAmount.fromAtomic(rawAmountA);
            const amountB = DummyAmount.fromAtomic(rawAmountB);
            const added = amountA.add(amountB);
            const addedRaw = DummyAmount.fromAtomic(rawAmountAdded);
            expect(added.toString(true)).to.eq(
              rawAmountAdded.round(0, RoundingMode.RoundDown).toString()
            );
            expect(added.eq(addedRaw));
            expect(amountA.toString(true)).to.eq(
              rawAmountA.round(0, RoundingMode.RoundDown).toString()
            );
            expect(amountB.toString(true)).to.eq(
              rawAmountB.round(0, RoundingMode.RoundDown).toString()
            );
          })
        );
      });
    });

    describe("sub", () => {
      it("should subtract and create new value", () => {
        fc.assert(
          fc.property(fcIntAsBig(), fcIntAsBig(), (rawAmountA, rawAmountB) => {
            const rawAmountSubbed = rawAmountA.sub(rawAmountB);
            const amountA = DummyAmount.fromAtomic(rawAmountA);
            const amountB = DummyAmount.fromAtomic(rawAmountB);
            const subbed = amountA.sub(amountB);
            const subbedRaw = DummyAmount.fromAtomic(rawAmountSubbed);
            expect(subbed.toString(true)).to.eq(
              rawAmountSubbed.round(0, RoundingMode.RoundDown).toString()
            );
            expect(subbed.eq(subbedRaw));
            expect(amountA.toString(true)).to.eq(
              rawAmountA.round(0, RoundingMode.RoundDown).toString()
            );
            expect(amountB.toString(true)).to.eq(
              rawAmountB.round(0, RoundingMode.RoundDown).toString()
            );
          })
        );
      });
    });

    describe("mul", () => {
      it("should multiply and create new value", () => {
        fc.assert(
          fc.property(fcIntAsBig(), fcDouble(), (rawAmount, multiplier) => {
            const rawAmountMultiplied = rawAmount.mul(multiplier);
            const amount = DummyAmount.fromAtomic(rawAmount);
            const multiplied = amount.mul(multiplier);
            const multipliedRaw = DummyAmount.fromAtomic(rawAmountMultiplied);
            expect(multiplied.toString(true)).to.eq(
              rawAmountMultiplied.round(0, RoundingMode.RoundDown).toString()
            );
            expect(multiplied.eq(multipliedRaw));
            expect(amount.toString(true)).to.eq(
              rawAmount.round(0, RoundingMode.RoundDown).toString()
            );
          })
        );
      });
    });

    describe("div", () => {
      it("should divide and create new value", () => {
        fc.assert(
          fc.property(
            fcIntAsBig(),
            fcDouble().filter((v) => v !== 0),
            (rawAmount, divisor) => {
              const rawAmountDivided = rawAmount
                .div(divisor)
                .round(0, RoundingMode.RoundDown); // smallest units can't have decimals
              const amount = DummyAmount.fromAtomic(rawAmount);
              const divided = amount.div(divisor);
              const dividedRaw = DummyAmount.fromAtomic(rawAmountDivided);
              expect(divided.toString(true)).to.eq(
                rawAmountDivided.round(0, RoundingMode.RoundDown).toString()
              );
              expect(divided.eq(dividedRaw));
              expect(amount.toString(true)).to.eq(
                rawAmount.round(0, RoundingMode.RoundDown).toString()
              );
            }
          )
        );
      });

      it("should fail when dividing by zero", () => {
        expect(() => new DummyAmount(1).div(0)).to.throw("Division by zero");
      });
    });
  });

  describe("isZero", () => {
    it("should be equal to zero if amount is lower than lowest possible unit of currency", () => {
      const smallestAmount = Big(1).div(10 ** DummyCurrency.decimals);
      const smallerThanSmallestUnitAmount = smallestAmount.div(10);

      expect(new DummyAmount(smallestAmount).isZero()).to.be.false;
      expect(new DummyAmount(smallerThanSmallestUnitAmount).isZero()).to.be
        .true;
    });
  });
});
