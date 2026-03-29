import { BaseNormalizer, createReplacementRules, applyRules, NormalizationRule } from './base-normalizer.js';
import { expect } from 'chai';
import 'mocha';

describe('createReplacementRules', () => {
  it('should create replacement rules from pairs', () => {
    const rules = createReplacementRules([['foo', 'bar'], ['baz', 'qux']]);
    expect(rules).to.have.length(2);
    expect(rules[0]).to.deep.equal({ type: 'replace', search: 'foo', replacement: 'bar' });
    expect(rules[1]).to.deep.equal({ type: 'replace', search: 'baz', replacement: 'qux' });
  });

  it('should return empty array for empty input', () => {
    expect(createReplacementRules([])).to.deep.equal([]);
  });
});

describe('applyRules', () => {
  it('should apply replace rules', () => {
    const rules: NormalizationRule[] = [{ type: 'replace', search: 'strasse', replacement: 'str' }];
    expect(applyRules('hauptstrasse', rules)).to.equal('hauptstr');
  });

  it('should apply translate rules', () => {
    const rules: NormalizationRule[] = [{ type: 'translate', search: '', fromChars: 'abc', toChars: 'xyz' }];
    expect(applyRules('abc', rules)).to.equal('xyz');
  });

  it('should apply truncateAt rules', () => {
    const rules: NormalizationRule[] = [{ type: 'truncateAt', search: '(' }];
    expect(applyRules('hello (world)', rules)).to.equal('hello ');
  });

  it('should not truncate if search not found', () => {
    const rules: NormalizationRule[] = [{ type: 'truncateAt', search: '(' }];
    expect(applyRules('hello world', rules)).to.equal('hello world');
  });

  it('should apply removePrefix rules', () => {
    const rules: NormalizationRule[] = [{ type: 'removePrefix', search: 'le ' }];
    expect(applyRules('le moulin', rules)).to.equal('moulin');
  });

  it('should not remove prefix if not at start', () => {
    const rules: NormalizationRule[] = [{ type: 'removePrefix', search: 'le ' }];
    expect(applyRules('dans le moulin', rules)).to.equal('dans le moulin');
  });

  it('should apply multiple rules in order', () => {
    const rules: NormalizationRule[] = [
      { type: 'replace', search: 'strasse', replacement: 'str' },
      { type: 'replace', search: 'str', replacement: 's' }
    ];
    expect(applyRules('hauptstrasse', rules)).to.equal('haupts');
  });
});

describe('BaseNormalizer', () => {
  it('should lowercase by default', () => {
    const normalizer = new BaseNormalizer({});
    expect(normalizer.normalize('HELLO')).to.equal('hello');
  });

  it('should remove accents by default', () => {
    const normalizer = new BaseNormalizer({});
    expect(normalizer.normalize('èéêë')).to.equal('eeee');
  });

  it('should replace umlauts by default', () => {
    const normalizer = new BaseNormalizer({});
    expect(normalizer.normalize('Höhe')).to.equal('hoehe');
  });

  it('should remove punctuation by default', () => {
    const normalizer = new BaseNormalizer({});
    expect(normalizer.normalize('a.b,c;d')).to.equal('abcd');
  });

  it('should remove spaces by default', () => {
    const normalizer = new BaseNormalizer({});
    expect(normalizer.normalize('hello world')).to.equal('helloworld');
  });

  it('should apply custom rules', () => {
    const normalizer = new BaseNormalizer({
      rules: [{ type: 'replace', search: 'strasse', replacement: 'str' }]
    });
    expect(normalizer.normalize('Hauptstrasse')).to.equal('hauptstr');
  });

  it('should remove configured prefixes', () => {
    const normalizer = new BaseNormalizer({
      prefixesToRemove: ['le ', 'la ']
    });
    expect(normalizer.normalize('Le Moulin')).to.equal('moulin');
  });

  it('should throw on non-string input', () => {
    const normalizer = new BaseNormalizer({});
    expect(() => normalizer.normalize(123 as unknown as string)).to.throw();
  });

  it('should respect toLowercase=false', () => {
    const normalizer = new BaseNormalizer({ toLowercase: false, removeAccents: false, replaceUmlauts: false, removePunctuation: false, removeSpaces: false });
    expect(normalizer.normalize('HELLO')).to.equal('HELLO');
  });
});
