# monetary

A library to handle currencies and money. Targeted at blockchain and cross-chain applications.

## About

Building systems with money is pretty hard. Especially when the monetary amounts that the application has to deal with uses different decimal representations, has numerous accounting units, and the same currency exists on multiple chains.

To tackle these issues, this library serves as a common interface to deal with monetary amounts in a safe and predictable way.

### Objectives

The overall goal of this library is two-fold:

1. Provide a secure currency interface. This includes safe arithmetic, type checking to ensure conversions between currencies are done correctly, and correct rounding.
2. Provide a universal currency interface. The interface should be able to have an identifiable name and ticker, and an "origin".

### Specification

We provide a light-weight specification to establish a common set of rules for the monetary library. Please check the [specification](docs/specification.md) for more details.

### References

- A good portion of this specification was inspired by this excellent post on [safe-money](https://ren.zone/articles/safe-money).
- There is also a great library for fiat currencies called [dinero.js](https://github.com/dinerojs/dinero.js) based on this [post](https://frontstuff.io/how-to-handle-monetary-values-in-javascript).

## Library

### Getting started

Install from npmjs:

```shell
npm i @interlay/monetary-js
```

Or

```shell
yarn add @interlay/monetary-js
```

### Usage

Assuming that the library already provides the currencies you require, you can readily use them as indicated below.
You may also add your own currencies without having to make an upstream contribution as explained in the [defining your own currencies section](#defining-your-own-currencies).

```ts
import Big from "big.js";
import { Bitcoin, Ethereum, BitcoinAmount, EthereumAmount, ExchangeRate} from "@interlay/monetary-js";

const bitcoins = new BitcoinAmount(0.5);
const ethers = new EthereumAmount(new Big(1).mul(10).pow(-9)); // one gwei
const sameEthers = new EthereumAmount("1e-9"); // also one gwei

// conversions to string and Big of different units
console.log(`We have ${bitcoins.toString()} BTC, and ${ethers.toString()} ethers.`);

const weiBig: Big = ethers.toBig(0); // value in atomic units (ETH * 10^-18 aka. wei)
const gweiBig: Big = ethers.toBig(9); // value in gwei (wei * 10^9)
const alsoEthBig: Big = ethers.toBig(18); // value in eth (wei * 10^18)
const ethBig: Big = ethers.toBig(); // value in eth (no parameter => assumes "natural" denomination)

const satoshiString: string = bitcoins.toString(true); // value as string in atomic units (satoshi)
const btcString: string = bitcoins.toString(); // value as string in "natural" units (btc)

// converting between different currencies
const ETHBTCRate = new ExchangeRate<Ethereum, Bitcoin>(
  Ethereum,
  Bitcoin,
  new Big(0.0598)
);

// for ETH/BTC, "base" is ETH, "counter" is BTC
const bitcoinsAsEthers: EthereumAmount = ETHBTCRate.toBase(bitcoins);

// type-safe arithmetic
const totalEthers = ethers.add(bitcoinsAsEthers);
// ethers.add(bitcoins); // error
```

### Defining your own currencies

Monetary-js comes with Bitcoin, Ethereum and Polkadot predefined, but it is meant to be extensible for any currency. `src/currencies/bitcoin.ts` can be used as an example for the minimal work needed to define a currency. Another example is `DummyCurrency` defined inline for unit tests in `test/monetary.test.ts`

The first step is to define our currency, parametrising the type with decimals. 

```ts
export const Bitcoin: Currency<typeof BitcoinUnit> = {
  name: "Bitcoin",
  ticker: "BTC",
  decimals: 8,
  humanDecimals: 5
} as const;
export type Bitcoin = typeof Bitcoin;
```

For a `MonetaryAmount`, the internal representation will be stored with a 10 to the power of `decimals` shift of the `Currency`. Rounding, default behaviors for `toString()` and `toBig()` will represent the amounts at that precision.
For example, when using an amount of `0.5 Bitcoin`, the internal representation is represented as `0.5 * 10^8` (50,000,000 Satoshi)
and all operations (`.add(...)`, `.sub(...)`, etc.) will use the internal representation.

`humanDecimals` is used for pretty-printing approximate (truncated) stringified values using `toHuman()`.

At this point, the currency is usable:

```ts
import { Bitcoin, BitcoinUnit } from "src/currencies/bitcoin";
const btcAmount = new MonetaryAmount<Bitcoin, BitcoinUnit>(
  Bitcoin,
  0.5,
  Bitcoin.units.BTC
);
```

However, this is a bit verbose. We can subclass `MonetaryAmount` for convenience:

```ts
export class BitcoinAmount extends MonetaryAmount<Bitcoin, BitcoinUnit> {
  // added convenience method
  static zero = () => new BitcoinAmount(0);
}
```

## Development

### Installation

Checkout the code and install the dependencies:

```shell
git clone https://github.com/interlay/monetary.git
cd monetary
yarn install
```

Build:

```shell
yarn build
```

And run tests:

```shell
yarn test
```

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are greatly appreciated. Our basic [contributing guidelines](CONTRIBUTING.md) are found in this repository.

1. Fork the project
2. Create your feature branch (`git checkout -b feat/AmazingFeature`)
3. Sign and commit your changes (`git commit -S -m 'feat: Add some AmazingFeature'`)
4. Push to the branch (`git push origin feat/AmazingFeature`)
5. Open a pull request

If you are searching for a place to start or would like to discuss features, reach out to us on the #development channel:

- [Discord](https://discord.gg/interlay)

## License

(C) Copyright 2023 [Interlay](https://www.interlay.io) Ltd

monetary is licensed under the terms of the MIT License. See [LICENSE](LICENSE).

## Contact

Website: [Interlay.io](https://www.interlay.io)

Twitter: [@interlayHQ](https://twitter.com/InterlayHQ)

Email: contact@interlay.io
