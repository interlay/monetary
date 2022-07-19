import { expect } from "chai";

import { Bitcoin, Ethereum, Polkadot } from "../src/currencies";

describe("Currencies", () => {
  describe("Bitcoin", () => {
    it("should have the correct amount of decimals", () => {
      expect(Bitcoin.decimals).to.eq(8);
    });

    it("should have the correct name", () => {
      expect(Bitcoin.name).to.eq("Bitcoin");
    });
  });

  describe("ETH", () => {
    it("should have the correct amount of decimals", () => {
      expect(Ethereum.decimals).to.eq(18);
    });

    it("should have the correct name", () => {
      expect(Ethereum.name).to.eq("Ethereum");
    });
  });

  describe("DOT", () => {
    it("should have the correct amount of decimals", () => {
      expect(Polkadot.decimals).to.eq(10);
    });

    it("should have the correct name", () => {
      expect(Polkadot.name).to.eq("Polkadot");
    });
  });
});
