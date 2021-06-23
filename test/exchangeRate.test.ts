import Big from "big.js";
import { expect } from "chai";
import {
  Bitcoin,
  BTCAmount,
  BTCUnit,
  ETHAmount,
  Ethereum,
  ETHUnit,
} from "../src/currencies";
import { ExchangeRate } from "../src/exchangeRate";
import * as fc from "fast-check";

const fcDouble = (): fc.Arbitrary<number> =>
  fc.double({ next: true, noDefaultInfinity: true, noNaN: true });

describe("ExchangeRate", () => {
  const rawRate = new Big(0.05849583145); // ETH/BTC
  const ETHBTCRate = new ExchangeRate<Ethereum, ETHUnit, Bitcoin, BTCUnit>(
    Ethereum,
    Bitcoin,
    rawRate
  );

  describe("toBase", () => {
    it("should correctly convert value", () => {
      fc.assert(
        fc.property(
          fcDouble(),
          (amount) => {
            const ethAmount = ETHBTCRate.toBase(
              BTCAmount.from.BTC(rawRate.mul(amount))
            );
            expect(ethAmount.toString(Ethereum.base)).to.eq(
              new Big(amount).round(Ethereum.base).toString()
            );
          }
        )
      );
    });
  });

  describe("toCounter", () => {
    it("should correctly convert value", () => {
      fc.assert(
        fc.property(
          fcDouble(),
          (amount) => {
            const btcAmount = ETHBTCRate.toCounter(ETHAmount.from.ETH(amount));
            expect(btcAmount.toString(Bitcoin.base)).to.eq(
              rawRate.mul(amount).round(Bitcoin.base).toString()
            );
          }
        )
      );
    });
  });

  describe("toBig", () => {
    it("should return the rate between base units by default", () => {
      expect(ETHBTCRate.toBig().toString()).to.eq(rawRate.toString());
    });

    it("should convert the rate for different currency units", () => {
      Object.entries(Bitcoin.units).map(([btcUnit, btcDecimals]) => {
        Object.entries(Ethereum.units).map(([ethUnit, ethDecimals]) => {
          const normalisedRate = rawRate
            .mul(new Big(10).pow(Bitcoin.base - btcDecimals)) // ETH/btcUnit
            .div(new Big(10).pow(Ethereum.base - ethDecimals)); // ethUnit/btcUnit
          expect(
            ETHBTCRate.toBig({
              baseUnit: ethDecimals,
              counterUnit: btcDecimals,
            }).toString()
          ).to.eq(
            normalisedRate.toString(),
            `Formatting failed with ${btcUnit} against ${ethUnit}`
          );
        });
      });
    });
  });

  describe("toRawBig", () => {
    it("should return the normalised rate (between smallest currency units)", () => {
      const normalisedRate = rawRate
        .mul(new Big(10).pow(Bitcoin.base)) // ETH/Sat
        .div(new Big(10).pow(Ethereum.base)); // Wei/Sat
      expect(ETHBTCRate.toRawBig().toString()).to.eq(normalisedRate.toString());
    });
  });

  describe("toString", () => {
    it("should return the rate between base units by default", () => {
      expect(ETHBTCRate.toString()).to.eq(rawRate.toString());
    });

    it("should convert the rate for different currency units", () => {
      Object.entries(Bitcoin.units).map(([btcUnit, btcDecimals]) => {
        Object.entries(Ethereum.units).map(([ethUnit, ethDecimals]) => {
          const normalisedRate = rawRate
            .mul(new Big(10).pow(Bitcoin.base - btcDecimals)) // ETH/btcUnit
            .div(new Big(10).pow(Ethereum.base - ethDecimals)); // ethUnit/btcUnit
          expect(
            ETHBTCRate.toString({
              baseUnit: ethDecimals,
              counterUnit: btcDecimals,
            })
          ).to.eq(
            normalisedRate.toString(),
            `Formatting failed with ${btcUnit} against ${ethUnit}`
          );
        });
      });
    });
  });

  describe("toRawString", () => {
    it("should return the normalised rate (between smallest currency units)", () => {
      const normalisedRate = rawRate
        .mul(new Big(10).pow(Bitcoin.base)) // ETH/Sat
        .div(new Big(10).pow(Ethereum.base)); // Wei/Sat
      expect(ETHBTCRate.toRawString()).to.eq(normalisedRate.toString());
    });
  });

  describe("toHuman", () => {
    it("should format with the max decimals of either currency by default", () => {
      const rate = rawRate.round(
        Math.max(Bitcoin.humanDecimals || 0, Ethereum.humanDecimals || 0)
      );
      expect(ETHBTCRate.toHuman()).to.eq(rate.toString());
    });

    it("should accept arbitrary decimals for rounding", () => {
      fc.assert(
        fc.property(
          fc.integer(-1e6, 1e6), // big.js decimal place limits
          (decimals) => {
            const rate = rawRate.round(decimals).toString();
            expect(ETHBTCRate.toHuman(decimals)).to.eq(rate);
          }
        )
      );
    });
  });
});
