import { expect } from 'chai';
import 'mocha';
import { createSedexEnvelope } from '../src/core/sedex-envelope.js';

describe('createSedexEnvelope', () => {

    it('should generate valid XML with correct structure', () => {
        const xml = createSedexEnvelope('4-802346-0', '20250101120000');
        expect(xml).to.include('<?xml');
        expect(xml).to.include('eCH-0090:envelope');
        expect(xml).to.include('eCH-0090:messageId');
        expect(xml).to.include('eCH-0090:messageType');
        expect(xml).to.include('eCH-0090:senderId');
        expect(xml).to.include('eCH-0090:recipientId');
    });

    it('should use message type 1086', () => {
        const xml = createSedexEnvelope('test-sender', 'test-msg');
        expect(xml).to.include('>1086<');
    });

    it('should use recipient 4-213246-6 (BFS)', () => {
        const xml = createSedexEnvelope('test-sender', 'test-msg');
        expect(xml).to.include('>4-213246-6<');
    });

    it('should include the sender ID', () => {
        const xml = createSedexEnvelope('4-802346-0', 'test-msg');
        expect(xml).to.include('>4-802346-0<');
    });

    it('should include the message ID', () => {
        const xml = createSedexEnvelope('test-sender', '20250101120000');
        expect(xml).to.include('>20250101120000<');
    });

    it('should include ISO 8601 date format in eventDate', () => {
        const xml = createSedexEnvelope('test', 'msg');
        // Matches YYYY-MM-DDTHH:mm:ss pattern
        const datePattern = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
        expect(xml).to.match(datePattern);
    });

    it('should include eCH-0090 namespace', () => {
        const xml = createSedexEnvelope('test', 'msg');
        expect(xml).to.include('xmlns:eCH-0090="http://www.ech.ch/xmlns/eCH-0090/1"');
    });

    it('should handle empty sender ID', () => {
        const xml = createSedexEnvelope('', 'msg');
        expect(xml).to.include('eCH-0090:senderId');
        expect(xml).to.be.a('string');
    });
});
