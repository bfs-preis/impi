import { normalizeCity } from './normalizeCity';
import { expect } from 'chai';

// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line

// import 'mocha';
describe('manual tests', () => {

    it('should return valruz', () => {

        const result = normalizeCity("Val-de-Ruz");
        console.log(result);
        expect(result).to.equal('valruz');
    
      });

      it('should return ilanzglion', () => {

        const result = normalizeCity("Ilanz/Glion");
        console.log(result);
        expect(result).to.equal('ilanzglion');
    
      });

      it('should return stgallen', () => {

        const result = normalizeCity("St. Gallen");
        expect(result).to.equal('stgallen');
    
      });

      it('should return romont', () => {

        const result = normalizeCity("Romont");
        expect(result).to.equal('romont');
    
      });

      it('should return bemont', () => {

        const result = normalizeCity("Le Bémont");
        expect(result).to.equal('bemont');
    
      });

      it('should return castel', () => {

        const result = normalizeCity("Castel San Pietro");
        expect(result).to.equal('castel');
    
      });

      it('should return riva', () => {

        const result = normalizeCity("Riva San Vitale");
        expect(result).to.equal('riva');
    
      });
});