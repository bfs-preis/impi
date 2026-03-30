import { Component, ViewEncapsulation, Input, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChartDataSet, ChartsComponent } from '../shared/charts/charts.component';
import { ILogViolation } from '../../models';

@Component({
  selector: 'app-chart-correct',
  templateUrl: './chart-correct.component.html',
  styleUrls: ['./chart-correct.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [ChartsComponent, TranslateModule]
})
export class ChartCorrectComponent {

  data!: ChartDataSet;
  violations!: ILogViolation[];
  rowCount = 0;

  private readonly translate = inject(TranslateService);

  @Input()
  set Violations(v: ILogViolation[]) {
    this.violations = v;
    this.prepareData();
  }

  @Input()
  set RowCount(rows: number) {
    this.rowCount = rows;
    this.prepareData();
  }

  prepareData(): void {
    if (!this.violations || this.rowCount === 0) return;

    const countValidationErrors = this.violations.reduce((sum, current) => sum + current.Count, 0);

    this.data = {
      Data: [(this.rowCount - 1 - countValidationErrors), countValidationErrors],
      Labels: [
        this.translate.instant('resultViewer.Charts.CorrectRows'),
        this.translate.instant('resultViewer.Charts.RowsWithViolations')
      ],
      Colors: ['green', 'red']
    } as ChartDataSet;
  }
}
