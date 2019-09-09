import { normalizeStreet, normalizeStreetNumber } from './normalizeStreet';
import { expect } from 'chai';

// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line

import 'mocha';
describe('manual tests', () => {

  it('should return hoehenw', () => {

    const result = normalizeStreet("Höhenweg");

    expect(result).to.equal('hoehenw');

  });

  it('should return hoeoehenw', () => {

    const result = normalizeStreet("Hööhenweg");

    expect(result).to.equal('hoeoehenw');

  });

  it('should return eeeeaaaooouuuiiic', () => {

    const result = normalizeStreet("èéêëàáâôòóûùúïíîç");

    expect(result).to.equal('eeeeaaaooouuuiiic');

  });

  it('should return hoehe', () => {

    const result = normalizeStreet("die Höhe");

    expect(result).to.equal('hoehe');

  });

  it('should return grei', () => {

    const result = normalizeStreet("A Gréi");
    expect(result).to.equal('grei');

  });

  it('should return grei', () => {
    const result = normalizeStreet("Gréi");
    expect(result).to.equal('grei');

  });

  it('should return smartin', () => {

    const result = normalizeStreet("A San Martin");
    expect(result).to.equal('smartin');

  });

  it('should return neuvecas', () => {

    const result = normalizeStreet("L'A Neuve CAS");
    expect(result).to.equal('neuvecas');

  });

  it('should return ry', () => {

    const result = normalizeStreet("A-Ry");
    expect(result).to.equal('ry');

  });
});

describe('manual streetNumber Tests', () => {
  it('should return 1a', () => {

    const result = normalizeStreetNumber("1a /1b");
    expect(result).to.equal('1a');

  });
  it('should return 1a', () => {

    const result = normalizeStreetNumber("1a / 1b");
    expect(result).to.equal('1a');

  });
  it('should return 1a', () => {

    const result = normalizeStreetNumber("1a/ 1b");
    expect(result).to.equal('1a');

  });
  it('should return 1a', () => {

    const result = normalizeStreetNumber("1a/1b");
    expect(result).to.equal('1a');

  });
});


