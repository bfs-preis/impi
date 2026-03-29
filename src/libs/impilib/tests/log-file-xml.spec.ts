import { expect } from 'chai';
import 'mocha';
import { createEmptyLogMatchingTypeArray, LogAsXmlString } from '../src/core/log-file-xml.js';
import { ILogResult, ILogMeta, ILogViolation, ILogMatchingType, ILogRow } from '../src/core/log-result.js';
import { MatchingTypeEnum } from '../src/match/match.js';

describe('createEmptyLogMatchingTypeArray', () => {
  it('should return an array with all MatchingTypeEnum values', () => {
    const result = createEmptyLogMatchingTypeArray();
    expect(result).to.be.an('array');
    expect(result.length).to.be.greaterThan(0);
  });

  it('should have Count=0 for all entries', () => {
    const result = createEmptyLogMatchingTypeArray();
    for (const entry of result) {
      expect(entry.Count).to.equal(0);
    }
  });

  it('should include PointMatching', () => {
    const result = createEmptyLogMatchingTypeArray();
    const pointMatching = result.find(r => r.Name === 'PointMatching');
    expect(pointMatching).to.not.be.undefined;
    expect(pointMatching!.Id).to.equal(MatchingTypeEnum.PointMatching);
  });

  it('should include NoMatching', () => {
    const result = createEmptyLogMatchingTypeArray();
    const noMatching = result.find(r => r.Name === 'NoMatching');
    expect(noMatching).to.not.be.undefined;
    expect(noMatching!.Id).to.equal(MatchingTypeEnum.NoMatching);
  });
});

describe('LogAsXmlString', () => {
  function createTestLogResult(): ILogResult {
    const meta: ILogMeta = {
      StartTime: new Date(2025, 0, 15, 10, 0, 0).getTime(),
      EndTime: new Date(2025, 0, 15, 10, 5, 30).getTime(),
      DbVersion: '1.0',
      DbPeriodFrom: new Date(2024, 0, 1).getTime(),
      DbPeriodTo: new Date(2024, 11, 31).getTime(),
      CsvEncoding: 'utf-8',
      CsvSeparator: ';',
      CsvRowCount: 100,
      OutZipFile: 'output.zip',
      MappingFile: 'mapping.xml',
      ClientVersion: '1.5.2',
      SedexSenderId: 'T4-123456-1',
    };

    const violations: ILogViolation[] = [
      { Id: 1, Text: 'Missing field', RedFlag: true, Count: 2, Rows: [3, 7] },
      { Id: 2, Text: 'Invalid format', RedFlag: false, Count: 1, Rows: [5] },
    ];

    const matchSummary: ILogMatchingType[] = [
      { Id: 0, Name: 'PointMatching', Count: 80 },
      { Id: 1, Name: 'CenterStreetMatching', Count: 15 },
      { Id: 3, Name: 'NoMatching', Count: 5 },
    ];

    const rows: ILogRow[] = [
      { Index: 1, MatchingType: MatchingTypeEnum.PointMatching, Violations: [] },
      { Index: 2, MatchingType: MatchingTypeEnum.NoMatching, Violations: [1, 2] },
    ];

    return {
      Meta: meta,
      Mapping: {
        Mappings: {
          'PLZ': { 'Source': 'plz', 'Target': 'PLZ' },
          'Ort': { 'Source': 'ort', 'Target': 'Ort' },
        },
        Scales: {
          'Scale1': '1000',
        }
      },
      Violations: violations,
      MatchSummary: matchSummary,
      Rows: rows,
      Error: null,
    };
  }

  it('should produce valid XML string', () => {
    const result = createTestLogResult();
    const xml = LogAsXmlString(result);
    expect(xml).to.be.a('string');
    expect(xml).to.include('<?xml');
    expect(xml).to.include('<Log>');
    expect(xml).to.include('</Log>');
  });

  it('should include Meta attributes', () => {
    const result = createTestLogResult();
    const xml = LogAsXmlString(result);
    expect(xml).to.include('ClientVersion="1.5.2"');
    expect(xml).to.include('SedexSenderId="T4-123456-1"');
    expect(xml).to.include('DbVersion="1.0"');
    expect(xml).to.include('CsvEncoding="utf-8"');
  });

  it('should include MatchSummery section', () => {
    const result = createTestLogResult();
    const xml = LogAsXmlString(result);
    expect(xml).to.include('<MatchSummery>');
    expect(xml).to.include('Name="PointMatching"');
    expect(xml).to.include('Count="80"');
  });

  it('should include Violations section', () => {
    const result = createTestLogResult();
    const xml = LogAsXmlString(result);
    expect(xml).to.include('<Violations>');
    expect(xml).to.include('<Rule');
    expect(xml).to.include('Name="Missing field"');
    expect(xml).to.include('RedFlag="true"');
    expect(xml).to.include('<Row>3</Row>');
  });

  it('should include Rows section', () => {
    const result = createTestLogResult();
    const xml = LogAsXmlString(result);
    expect(xml).to.include('<Rows>');
    expect(xml).to.include('Index="1"');
    expect(xml).to.include('MatchingType="0"');
  });

  it('should include Mapping with Properties', () => {
    const result = createTestLogResult();
    const xml = LogAsXmlString(result);
    expect(xml).to.include('<Mapping>');
    expect(xml).to.include('<Mappings>');
    expect(xml).to.include('Name="PLZ"');
    expect(xml).to.include('<Scales>');
    expect(xml).to.include('Name="Scale1"');
  });

  it('should include Exception when Error is present', () => {
    const result = createTestLogResult();
    result.Error = new Error('Test error message');
    const xml = LogAsXmlString(result);
    expect(xml).to.include('<Exception>');
    expect(xml).to.include('Test error message');
  });

  it('should not include Exception when Error is null', () => {
    const result = createTestLogResult();
    result.Error = null;
    const xml = LogAsXmlString(result);
    expect(xml).to.not.include('<Exception>');
  });
});
