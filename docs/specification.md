# Monetary Specification

## Terminology

A *Currency* represents a uniquely identifiable unit of account.

A *Monetary Amount* represents an amount of a specific currency.

## Identification

- Any currency MUST be uniquely identifiable via its symbol.

## Arithmetic

- Any monetary amount MUST be represented by a fixed-point representation.
- Any monetary amount MUST use flooring as the default rounding strategy.
- Any monetary amount MUST ensure that arithmetic operations are only allowed with the same currency.
- Any monetary amount MUST return an error on over- and underflow of an arithmetic operation.

## Representation

- Any monetary amount MUST be readily convertible to common denominations.
- Any monetary amount's smallest denomination MUST be representable as an integer.
- Where necessary, additional denominations MAY be readily returned.
- The currency MAY provide a truncated decimal representation for human-friendly readability.

## Exchange Rates

- Any monetary amount MAY be converted to another monetary amount given that there is an exchange rate available for the currency pair.

## Serialization

- Any monetary amount MUST be convertible to a deterministic string representation.
- Any monetary amount MUST be able to be decoded from its corresponding string representation.
