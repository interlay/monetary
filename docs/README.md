# monetary

A cross-language library to handle currencies and money.

## About

Building systems with money is pretty hard. Especially when the monetary amounts that the application has to deal with uses different decimals and have a different "origin", i.e., chains issuing custom tokens.

To tackle these issues, this library should serve as a specification for a common interface to handle monetary amounts as well as provide reference implementations. Specifically, the objective for this library is to:

1. Provide a secure currency interface. This includes safe arithmetic, type checking to ensure conversions between currencies are done correctly, safe conversion between denominations, and correct rounding.
2. Provide a universal currency interface. The interface should be able to handle different denominations, an identifiable name and ticker, and an "origin".

### References

- A good portion of this specification was inspired by this excellent post on [safe-money](https://ren.zone/articles/safe-money).

## Library

### Installation

TODO

### Testing

TODO

## Specification

### Prerequisites

Make sure you have `yarn` installed. Install docsify globally:

```shell
yarn global add docsify-cli
```

### Installation

Clone the repository:

```shell
git clone git@github.com:interlay/monetary.git
```

Build the documentation:

```shell
docsify serve ./docs
```

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are greatly appreciated.

1. Fork the project
2. Create your feature branch (`git checkout -b feat/AmazingFeature`)
3. Sign and commit your changes (`git commit -S -m 'feat: Add some AmazingFeature'`)
4. Push to the branch (`git push origin feat/AmazingFeature`)
5. Open a pull request

If you are searching for a place to start or would like to discuss features, reach out to us:

- [Discord](https://discord.gg/KgCYK3MKSf)

## License

(C) Copyright 2021 [Interlay](https://www.interlay.io) Ltd

monetary is licensed under the terms of the MIT License. See [LICENSE](LICENSE).

## Contact

Website: [Interlay.io](https://www.interlay.io)

Twitter: [@interlayHQ](https://twitter.com/InterlayHQ)

Email: contact@interlay.io