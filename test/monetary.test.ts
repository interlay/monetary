import Big, { BigSource } from "big.js";
import { expect } from "chai";
import * as fc from "fast-check";

import {
  Currency,
  generateFromConversions,
  MonetaryAmount,
} from "../src/monetary";

const fcBig = (): fc.Arbitrary<Big> => fc.integer().map((v) => new Big(v));

const DummyUnit = {
  Base: 10,
  Intermediate: 5,
  Integer: 0,
} as const;
export type DummyUnit = typeof DummyUnit;
export const DummyCurrency: Currency<DummyUnit> = {
  name: "Dummy",
  base: "Base",
  units: DummyUnit,
  humanDecimals: 3,
} as const;
export type DummyCurrency = typeof DummyCurrency;

export class DummyAmount extends MonetaryAmount<DummyCurrency, DummyUnit> {
  constructor(amount: BigSource, unit?: DummyUnit[keyof DummyUnit]) {
    super(DummyCurrency, amount, unit || 0);
  }
  withAmount(amount: BigSource): this {
    const Cls = this.constructor as new (amount: BigSource) => this;
    return new Cls(amount);
  }
  static from = generateFromConversions(DummyCurrency, DummyUnit);
}

function scaleBig(big: Big, decimals: number) {
  return big.mul(new Big(10).pow(decimals));
}

describe("MonetaryAmount", () => {
  describe("constructor and toString", () => {
    it("should use 0 decimal unit by default", () => {
      fc.assert(
        fc.property(fcBig(), (rawAmount) => {
          const amount = new DummyAmount(rawAmount);
          expect(amount.toString()).to.eq(rawAmount.toString());
        })
      );
    });

    it("should construct from other units of the currency", () => {
      fc.assert(
        fc.property(fcBig(), (unitAmount) => {
          Object.entries(DummyUnit).map(([_unit, decimals]) => {
            const amount = new DummyAmount(unitAmount, decimals);
            const rawAmount = scaleBig(unitAmount, decimals);
            expect(amount.toString()).to.eq(rawAmount.toString());
          });
        })
      );
    });

    it("should format to other units of the currency", () => {
      fc.assert(
        fc.property(fcBig(), (rawAmount) => {
          Object.entries(DummyUnit).map(([_unit, decimals]) => {
            const amount = new DummyAmount(rawAmount);
            expect(amount.toString(decimals)).to.eq(
              scaleBig(rawAmount, -decimals).toString()
            );
          });
        })
      );
    });
  });

  describe("toHuman", () => {
    it("should format to base unit with default decimals", () => {
      fc.assert(
        fc.property(fcBig(), (rawAmount) => {
          const amount = new DummyAmount(rawAmount);
          const scaled = amount
            .toBig(DummyUnit[DummyCurrency.base])
            .round(DummyCurrency.humanDecimals)
            .toString();
          expect(amount.toHuman()).to.eq(scaled);
        })
      );
    });

    it("should format to base unit with custom decimals", () => {
      fc.assert(
        fc.property(
          fcBig(),
          fc.integer(-1e6, 1e6), // big.js decimal place limits
          (rawAmount, decimals) => {
            const amount = new DummyAmount(rawAmount);
            const scaled = amount
              .toBig(DummyUnit[DummyCurrency.base])
              .round(decimals)
              .toString();
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
            const amountA = new DummyAmount(rawAmount);
            const amountB = new DummyAmount(rawAmount);
            expect(amountA.eq(amountB));
          })
        );
      });
    });

    describe("add", () => {
      it("should add and create new value", () => {
        fc.assert(
          fc.property(fcBig(), fcBig(), (rawAmountA, rawAmountB) => {
            const rawAmountAdded = rawAmountA.add(rawAmountB);
            const amountA = new DummyAmount(rawAmountA);
            const amountB = new DummyAmount(rawAmountB);
            const added = amountA.add(amountB);
            const addedRaw = new DummyAmount(rawAmountAdded);
            expect(added.toString()).to.eq(rawAmountAdded.toString());
            expect(added.eq(addedRaw));
            expect(amountA.toString()).to.eq(rawAmountA.toString());
            expect(amountB.toString()).to.eq(rawAmountB.toString());
          })
        );
      });
    });

    describe("sub", () => {
      it("should subtract and create new value", () => {
        fc.assert(
          fc.property(fcBig(), fcBig(), (rawAmountA, rawAmountB) => {
            const rawAmountSubbed = rawAmountA.sub(rawAmountB);
            const amountA = new DummyAmount(rawAmountA);
            const amountB = new DummyAmount(rawAmountB);
            const subbed = amountA.sub(amountB);
            const subbedRaw = new DummyAmount(rawAmountSubbed);
            expect(subbed.toString()).to.eq(rawAmountSubbed.toString());
            expect(subbed.eq(subbedRaw));
            expect(amountA.toString()).to.eq(rawAmountA.toString());
            expect(amountB.toString()).to.eq(rawAmountB.toString());
          })
        );
      });
    });

    describe("mul", () => {
      it("should multiply and create new value", () => {
        fc.assert(
          fc.property(fcBig(), fc.integer(), (rawAmount, multiplier) => {
            const rawAmountMultiplied = rawAmount.mul(multiplier);
            const amount = new DummyAmount(rawAmount);
            const multiplied = amount.mul(multiplier);
            const multipliedRaw = new DummyAmount(rawAmountMultiplied);
            expect(multiplied.toString()).to.eq(rawAmountMultiplied.toString());
            expect(multiplied.eq(multipliedRaw));
            expect(amount.toString()).to.eq(rawAmount.toString());
          })
        );
      });
    });

    describe("div", () => {
      it("should divide and create new value", () => {
        fc.assert(
          fc.property(
            fcBig(),
            fc.integer().filter((v) => v !== 0),
            (rawAmount, divisor) => {
              const rawAmountDivided = rawAmount.div(divisor).round(0); // smallest units can't have decimals
              const amount = new DummyAmount(rawAmount);
              const divided = amount.div(divisor);
              const dividedRaw = new DummyAmount(rawAmountDivided);
              expect(divided.toString()).to.eq(rawAmountDivided.toString());
              expect(divided.eq(dividedRaw));
              expect(amount.toString()).to.eq(rawAmount.toString());
            }
          )
        );
      });

      it("should fail when dividing by zero", () => {
        expect(() => new DummyAmount(1).div(0)).to.throw("Division by zero");
      });
    });
  });

  describe("Conversions", () => {
    it("should have methods to convert to big every unit", () => {
      fc.assert(
        fc.property(fcBig(), (rawAmount) => {
          Object.entries(DummyUnit).map(([unit, decimals]) => {
            const amount = new DummyAmount(rawAmount);
            expect(amount.to).to.have.property(unit);
            const rawBig = amount.toBig(decimals);
            const toBig = amount.to[unit as keyof DummyUnit]();
            expect(rawBig.eq(toBig));
          });
        })
      );
    });

    it("should have methods to stringify to every unit", () => {
      fc.assert(
        fc.property(fcBig(), (rawAmount) => {
          Object.entries(DummyUnit).map(([unit, decimals]) => {
            const amount = new DummyAmount(rawAmount);
            expect(amount.to).to.have.property(unit);
            const rawString = amount.toString(decimals);
            const toStr = amount.str[unit as keyof DummyUnit]();
            expect(rawString).to.equal(toStr);
          });
        })
      );
    });

    it("should have had static methods generated to construct from every unit", () => {
      fc.assert(
        fc.property(fcBig(), (rawAmount) => {
          Object.entries(DummyUnit).map(([unit, decimals]) => {
            expect(DummyAmount.from).to.have.property(unit);
            const amount = DummyAmount.from[unit as keyof DummyUnit](rawAmount);
            const controlAmount = new DummyAmount(rawAmount, decimals);
            expect(amount.eq(controlAmount));
          });
        })
      );
    });
  });
});
