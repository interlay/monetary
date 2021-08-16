# Monetary Specification

## Terminology

A *Currency* represents a uniquely identifiable unit of account.

A *Monetary Amount* represents an amount of a specific currency.

## Identification

Currencies typically have a symbol making it easy to identify the currency (e.g., USD, DAI, DOT).
However, in a multi-chain system a currency can exist on different chains like USDT on Ethereum and Bitcoin.
Moreover, the same currency can also exist between testnet and mainnet applications.
As a result, we include an *origin* that defines where the asset is created.

- Any currency MUST have a unique origin representing the system it was created in.
- Any currency MUST have a symbol.
- Any currency MUST be uniquely identifiable via its (symbol, origin) tuple.

## Arithmetic

- Any monetary amount MUST be represented by a fixed-point representation.
- Any monetary amount MUST use flooring as the default rounding strategy.
- Any monetary amount MUST ensure that arithmetic operations are only allowed with the same currency.
- Any monetary amount MUST return an error on over- and underflow of an arithmetic operation.

## Representation

- Any monetary amount MUST be readily convertible to common denominations.
- Any monetary amount's smallest denomination MUST be representable as an integer.
- Where necessary, additional denominations MAY be readily returned.
- Where necessary, the monetary amount MAY be represented as a string.
- The currency MAY provide a truncated decimal representation for better readibility.

## Exchange Rates

- Any monetary amount MAY be converted to another monetary amount given that there is an exchange rate available for the currency pair.

## Serialization

- Any monetary amount MUST be convertible to a string representation.
