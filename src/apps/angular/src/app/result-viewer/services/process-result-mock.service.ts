import { Injectable } from '@angular/core';
import { ILogResult } from '../models';

@Injectable()
export class ProcessResultMockService {

  GetProcessResult(): Promise<ILogResult | null> {
    return Promise.resolve({
      Meta: {
        CsvEncoding: 'utf-8',
        CsvSeparator: ';',
        CsvRowCount: 150,
        DbVersion: '2024.1',
        DbPeriodFrom: new Date(2024, 0, 1).getTime(),
        DbPeriodTo: new Date(2024, 11, 31).getTime(),
        SedexSenderId: 'T4-000000-0',
        MappingFile: 'mapping.json',
        StartTime: Date.now() - 300000,
        EndTime: Date.now(),
        OutZipFile: 'output.zip',
        ClientVersion: '1.5.2',
      },
      Mapping: undefined,
      Violations: [
        { Id: 1, Text: 'Missing street', RedFlag: true, Count: 5, Rows: [2, 5, 10, 22, 45] },
        { Id: 2, Text: 'Invalid zip code', RedFlag: false, Count: 3, Rows: [7, 14, 30] },
        { Id: 3, Text: 'Missing year of construction', RedFlag: false, Count: 2, Rows: [11, 33] },
      ],
      MatchSummary: [
        { Id: 0, Name: 'PointMatching', Count: 120 },
        { Id: 1, Name: 'CenterStreetMatching', Count: 20 },
        { Id: 2, Name: 'CenterCommunitiesMatching', Count: 5 },
        { Id: 3, Name: 'NoMatching', Count: 4 },
        { Id: 4, Name: 'NoMatchingWithError', Count: 1 },
      ],
      Rows: [],
      Error: null,
    });
  }

  GetShowAllValidationErrors(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
