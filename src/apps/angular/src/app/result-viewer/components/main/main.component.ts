import { Component, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ProcessResultService } from '../../services/process-result.service';
import { ILogResult } from '../../models';
import { ProcessInfoComponent } from '../process-info/process-info.component';
import { ChartCorrectComponent } from '../chart-correct/chart-correct.component';
import { ChartMatchesComponent } from '../chart-matches/chart-matches.component';
import { ChartViolationsComponent } from '../chart-violations/chart-violations.component';

@Component({
  selector: 'app-result-viewer-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  standalone: true,
  imports: [MatTabsModule, ProcessInfoComponent, ChartCorrectComponent, ChartMatchesComponent, ChartViolationsComponent]
})
export class MainComponent implements OnInit {

  processResult: ILogResult | null = null;

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
      }
    });
  }
}
