import { globalReplace, translate, validateStringInput } from './string-utils.js';
import { expect } from 'chai';
import 'mocha';

describe('globalReplace', () => {
  it('should replace all occurrences of search string', () => {
    expect(globalReplace('foo bar foo', 'foo', 'baz')).to.equal('baz bar baz');
  });

  it('should handle empty search string', () => {
    // split('') splits into individual characters, join inserts between each
    expect(globalReplace('abc', '', 'x')).to.equal('axbxc');
  });

  it('should handle no match', () => {
    expect(globalReplace('abc', 'z', 'x')).to.equal('abc');
  });

  it('should handle empty input string', () => {
    expect(globalReplace('', 'a', 'b')).to.equal('');
  });

  it('should replace with empty string (deletion)', () => {
    expect(globalReplace('a.b.c', '.', '')).to.equal('abc');
  });
});

describe('translate', () => {
  it('should translate characters based on mappings', () => {
    expect(translate('abc', 'abc', 'xyz')).to.equal('xyz');
  });

  it('should translate accented characters', () => {
    expect(translate('èéêë', 'èéêë', 'eeee')).to.equal('eeee');
  });

  it('should leave unmapped characters unchanged', () => {
    expect(translate('hello', 'aeiou', '12345')).to.equal('h2ll4');
  });

  it('should handle empty fromChars', () => {
    expect(translate('abc', '', '')).to.equal('abc');
  });

  it('should handle string with no matching characters', () => {
    expect(translate('xyz', 'abc', '123')).to.equal('xyz');
  });
});

describe('validateStringInput', () => {
  it('should return the string when input is a string', () => {
    expect(validateStringInput('hello', 'test')).to.equal('hello');
  });

  it('should return empty string when input is empty', () => {
    expect(validateStringInput('', 'test')).to.equal('');
  });

  it('should throw on number input', () => {
    expect(() => validateStringInput(123, 'field')).to.throw('field must be a string, received: number');
  });

  it('should throw on null input', () => {
    expect(() => validateStringInput(null, 'field')).to.throw('field must be a string, received: object');
  });

  it('should throw on undefined input', () => {
    expect(() => validateStringInput(undefined, 'field')).to.throw('field must be a string, received: undefined');
  });
});
