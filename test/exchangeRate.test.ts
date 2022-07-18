import Big, { RoundingMode } from "big.js";
import { expect } from "chai";
import {
  Bitcoin,
  BitcoinAmount,
  EthereumAmount,
  Ethereum,
} from "../src/currencies";
import { ExchangeRate } from "../src/exchangeRate";
import * as fc from "fast-check";

const fcDouble = (): fc.Arbitrary<number> =>
  fc.double({ next: true, noDefaultInfinity: true, noNaN: true });

describe("ExchangeRate", () => {
  const rawRate = new Big(0.05849583145); // ETH/BTC
  const ETHBTCRate = new ExchangeRate<Ethereum, Bitcoin>(
    Ethereum,
    Bitcoin,
    rawRate
  );
  const smallDenominationRawRate = new Big(0.000000000005849583145); // WEI/SAT
  const WEISATRate = new ExchangeRate<Ethereum, Bitcoin>(
    Ethereum,
    Bitcoin,
    smallDenominationRawRate,
    0,
    0
  );

  const ethUnits = {
    ETH: 18,
    Gwei: 9,
    Wei: 0,
  };
  const btcUnits = {
    BTC: 8,
    Satoshi: 0,
  };

  describe("toBase", () => {
    it("should correctly convert value", () => {
      fc.assert(
        fc.property(fcDouble(), (amount) => {
          const ethAmount = ETHBTCRate.toBase(
            new BitcoinAmount(rawRate.mul(amount))
          );
          expect(ethAmount.toString()).to.eq(
            new Big(amount)
              .round(Ethereum.decimals, RoundingMode.RoundDown)
              .toString()
          );
        })
      );
    });
  });

  describe("toCounter", () => {
    it("should correctly convert value", () => {
      fc.assert(
        fc.property(fcDouble(), (amount) => {
          const btcAmount = ETHBTCRate.toCounter(new EthereumAmount(amount));
          expect(btcAmount.toString()).to.eq(
            rawRate
              .mul(amount)
              .round(Bitcoin.decimals, RoundingMode.RoundDown)
              .toString()
          );
        })
      );
    });
  });

  describe("toBig", () => {
    it("should return the rate between base units by default", () => {
      expect(ETHBTCRate.toBig().toString()).to.eq(rawRate.toString());
    });

    it("should convert the rate for different currency units", () => {
      Object.entries(btcUnits).map(([btcUnit, btcDecimals]) => {
        Object.entries(ethUnits).map(([ethUnit, ethDecimals]) => {
          const normalisedRate = rawRate
            .mul(new Big(10).pow(Bitcoin.decimals - btcDecimals)) // ETH/btcUnit
            .div(new Big(10).pow(Ethereum.decimals - ethDecimals)); // ethUnit/btcUnit
          expect(ETHBTCRate.toBig([ethDecimals, btcDecimals]).toString()).to.eq(
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
        .mul(new Big(10).pow(Bitcoin.decimals)) // ETH/Sat
        .div(new Big(10).pow(Ethereum.decimals)); // Wei/Sat
      expect(ETHBTCRate.toRawBig().toString()).to.eq(normalisedRate.toString());
    });
  });

  describe("toString", () => {
    it("should return the rate between base units by default", () => {
      expect(ETHBTCRate.toString()).to.eq(rawRate.toString());
    });

    it("should consider rates equal using different denominations", () => {
      expect(ETHBTCRate.toString()).to.eq(WEISATRate.toString());
    });

    it("should convert the rate for different currency units", () => {
      Object.entries(btcUnits).map(([btcUnit, btcDecimals]) => {
        Object.entries(ethUnits).map(([ethUnit, ethDecimals]) => {
          const normalisedRate = rawRate
            .mul(new Big(10).pow(Bitcoin.decimals - btcDecimals)) // ETH/btcUnit
            .div(new Big(10).pow(Ethereum.decimals - ethDecimals)); // ethUnit/btcUnit
          expect(ETHBTCRate.toString([ethDecimals, btcDecimals])).to.eq(
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
        .mul(new Big(10).pow(Bitcoin.decimals)) // ETH/Sat
        .div(new Big(10).pow(Ethereum.decimals)); // Wei/Sat
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
