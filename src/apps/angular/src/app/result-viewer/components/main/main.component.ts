import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { ProcessResultService } from '../../services/process-result.service';
import { ILogResult } from '../../models';
import { ChartCorrectComponent } from '../chart-correct/chart-correct.component';
import { ChartMatchesComponent } from '../chart-matches/chart-matches.component';
import { ChartViolationsComponent } from '../chart-violations/chart-violations.component';

@Component({
  selector: 'app-result-viewer-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  standalone: true,
  imports: [MatCardModule, MatIconModule, TranslateModule, ChartCorrectComponent, ChartMatchesComponent, ChartViolationsComponent]
})
export class MainComponent implements OnInit {

  processResult: ILogResult | null = null;

  totalRows = 0;
  duration = '00:00:00';
  successRate = '0.0';
  violationCount = 0;
  outZipFile = '';
  outSedexFile = '';

  constructor(private processResultService: ProcessResultService) { }

  ngOnInit(): void {
    Promise.all([
      this.processResultService.GetProcessResult(),
      this.processResultService.GetShowAllValidationErrors()
    ]).then((values) => {
      const r = values[0];
      const flag = values[1];

      if (r) {
        if (flag === false && r.Violations) {
          r.Violations = r.Violations.filter((v) => v.RedFlag === true);
        }
        if (r.Violations) {
          r.Violations = r.Violations.sort((a, b) => a.Id - b.Id);
        }
        this.processResult = r;
        this.computeKpis();
      }
    });
  }

  private computeKpis(): void {
    if (!this.processResult?.Meta) return;

    this.totalRows = this.processResult.Meta.CsvRowCount;

    const durationMs = this.processResult.Meta.EndTime - this.processResult.Meta.StartTime;
    this.duration = moment.utc(durationMs).format('HH:mm:ss');

    const rowsWithViolations = this.processResult.Rows
      ? new Set(this.processResult.Rows.filter(r => r.Violations.length > 0).map(r => r.Index)).size
      : 0;

    if (this.totalRows > 0) {
      this.successRate = ((this.totalRows - rowsWithViolations) / this.totalRows * 100).toFixed(1);
    }

    this.outZipFile = this.processResult.Meta.OutZipFile || '';
    this.outSedexFile = this.processResult.Meta.OutSedexFile || '';
  }

  openOutputFile(): void {
    const ipc = (window as any).electron?.ipcRenderer;
    if (ipc && this.outZipFile) {
      ipc.send('open-path', this.outZipFile);
    }
  }

  openSedexFile(): void {
    const ipc = (window as any).electron?.ipcRenderer;
    if (ipc && this.outSedexFile) {
      ipc.send('open-path', this.outSedexFile);
    }
  }

  fileName(fullPath: string): string {
    return fullPath.substring(fullPath.lastIndexOf('/') + 1);
  }
}
