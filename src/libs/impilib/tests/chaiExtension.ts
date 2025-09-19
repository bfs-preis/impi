declare module Chai {
   export interface Assertion {
    equalBigInt(big: bigInt.BigInteger): void;
  }
}
