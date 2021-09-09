# monetary

A library to handle currencies and money. Targeted at blockchain and cross-chain applications.

## About

Building systems with money is pretty hard. Especially when the monetary amounts that the application has to deal with uses different decimal representations, has numerous accounting units, and the same currency exists on multiple chains.

To tackle these issues, this library serves as a common interface to deal with monetary amounts in a safe and predictable way.

### Objectives

The overall goal of this library is two-fold:

1. Provide a secure currency interface. This includes safe arithmetic, type checking to ensure conversions between currencies are done correctly, safe conversion between denominations, and correct rounding.
2. Provide a universal currency interface. The interface should be able to handle different denominations, an identifiable name and ticker, and an "origin".

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
import Big from 'big.js';
import { BitcoinAmount, BitcoinUnit, EthereumAmount, EthereumUnit } from '@interlay/monetary-js';

const bitcoins = BitcoinAmount.from.BTC(0.5);
const ethers = EthereumAmount.from.GWei(10000);

// conversions to string and Big of different units
console.log(`We have ${bitcoins.str.Satoshi()} Satoshi, and ${ethers.str.ETH()} whole ethers.`);
const weiBig: Big = ethers.to.Wei();

// the same conversions can be accessed through toString() and toBig(), by specifying the units
console.log(`We have ${bitcoins.toString(BitcoinUnit.Satoshi)} Satoshi, and ${ethers.toString(EthereumUnit.ETH)} whole ethers.`);
const weiBig: Big = ethers.toBig(EthereumUnit.Wei);

// converting between different currencies
const ETHBTCRate = new ExchangeRate<Ethereum, EthereumUnit, Bitcoin, BitcoinUnit>(
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

The first task is to define the units, which are just key-value pairs defining the decimal places for each unit. For instance, Bitcoin consists of 10^8 Satoshi, with Satoshi being the smallest (atomic) unit that only exists in integer amounts. Thus:

```ts
const BitcoinUnit = {
  BTC: 8,
  Satoshi: 0,
} as const;
export type BitcoinUnit = typeof BitcoinUnit;
```

Among the units above, one entry should represent the `rawBase` unit (Satoshi in the case of Bitcoin, or an arbitrary value in the case of currencies like Tether). Intuitively, `rawBase` should be smaller than or equal to the `base` unit, described in the next step. For currencies like Tether that don't have a traditional `rawBase` value, the units definition may look like:

```ts
const TetherUnit = {
  Tether: 6,
  Raw: 0
} as const;
export type TetherUnit = typeof TetherUnit;
```

The next step is to define our currency, parametrising the type with our units:

```ts
export const Bitcoin: Currency<typeof BitcoinUnit> = {
  name: "Bitcoin",
  base: BitcoinUnit.BTC,
  rawBase: BitcoinUnit.Satoshi,
  units: BitcoinUnit,
  humanDecimals: 5,
} as const;
export type Bitcoin = typeof Bitcoin;
```

The values should be self-explanatory. The `base` field defines the "primary" unit for the currency - BTC for Bitcoin, ETH for Ethereum, DOT for Polkadot, etc. This is used for human-friendly formatting. `humanDecimals` is used for pretty-printing approximate (truncated) stringified values using `toHuman()`.

At this point, the currency is usable:

```ts
import { Bitcoin, BitcoinUnit } from 'src/currencies/bitcoin';
const btcAmount = new MonetaryAmount<Bitcoin, BitcoinUnit>(Bitcoin, 0.5, Bitcoin.units.BTC);
```

However, this is a bit verbose. We can subclass `MonetaryAmount` for convenience:

```ts
export class BitcoinAmount extends MonetaryAmount<Bitcoin, BitcoinUnit> {
  static from = generateFromConversions(Bitcoin, BitcoinUnit);
}
```

Notice that we define a static member `from` - recall from the examples above that this can be used as syntactic sugar to bypass the constructor. `generateFromConversions` automatically populates the required object with the necessary functions, based on the currency and unit objects.

And that's all that's necessary to define a currency. Of course, this can be extended as required - for instance, `src/currencies/ethereum.ts` extends the `Currency` interface and add support for ETC20 contracts with configurable addresses.
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

- [Discord](https://discord.gg/KgCYK3MKSf)

## License

(C) Copyright 2021 [Interlay](https://www.interlay.io) Ltd

monetary is licensed under the terms of the MIT License. See [LICENSE](LICENSE).

## Contact

Website: [Interlay.io](https://www.interlay.io)

Twitter: [@interlayHQ](https://twitter.com/InterlayHQ)

Email: contact@interlay.io
