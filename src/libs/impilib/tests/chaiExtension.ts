import bigInt from 'big-integer';

declare global {
  namespace Chai {
    interface Assertion {
      equalBigInt(big: bigInt.BigInteger): Assertion;
    }
  }
}
