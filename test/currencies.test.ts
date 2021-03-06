import { expect } from "chai";

import { Bitcoin, Ethereum, ERC20, Polkadot } from '../src/currencies';

describe("Currencies", () => {
  describe("Bitcoin", () => {
    it("should have the correct amount of decimals", () => {
      expect(Bitcoin.base).to.eq(8);
    });

    it("should have the correct name", () => {
      expect(Bitcoin.name).to.eq("Bitcoin");
    });
  });

  describe("ETH", () => {
    it("should have the correct amount of decimals", () => {
      expect(Ethereum.base).to.eq(18);
    });

    it("should have the correct name", () => {
      expect(Ethereum.name).to.eq("Ethereum");
    });
  });

  describe("DOT", () => {
    it("should have the correct amount of decimals", () => {
      expect(Polkadot.base).to.eq(10);
    });

    it("should have the correct name", () => {
      expect(Polkadot.name).to.eq("Polkadot");
    });
  });

  describe("ERC20", () => {
    const DaiUnits = {
      Dai: 18,
      Raw: 0
    };
    const dai: ERC20<typeof DaiUnits> = {
      name: "Dai",
      units: DaiUnits,
      base: DaiUnits.Dai,
      rawBase: DaiUnits.Raw,
      address: "0x",
      ticker: "DAI"
    };

    const CompoundUnits = {
      Compound: 12,
      Raw: 0
    };
    const comp: ERC20<typeof CompoundUnits> = {
      name: "Compound",
      units: CompoundUnits,
      base: CompoundUnits.Compound,
      rawBase: CompoundUnits.Raw,
      address: "0x",
      ticker: "COMP"
    };

    it("should have customizable decimals", () => {
      expect(dai.base).to.eq(18);
      expect(comp.base).to.eq(12);
    });

    it("should have an address", () => {
      expect(dai.address).to.be.a('string');
      expect(comp.address).to.be.a('string');
    });

    it("should have customizable name", () => {
      expect(dai.name).to.eq("Dai");
      expect(comp.name).to.eq("Compound");
    });
  });
});
