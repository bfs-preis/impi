import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { ChartDataSet } from '../shared/charts/charts.component';
import { ILogViolation } from 'impilib';

@Component({
  selector: 'app-chart-correct',
  templateUrl: './chart-correct.component.html',
  styleUrls: ['./chart-correct.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ChartCorrectComponent implements OnInit {

  data: ChartDataSet
  violations: ILogViolation[];
  rowCount: number = 0;

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


  constructor() { }

  ngOnInit() {
    this.prepareData();
  }

  prepareData(): void {
    if (!this.violations || this.rowCount==0) return;

    let countValidationErrors=this.violations.reduce((sum, current) => sum + current.Count, 0);

    this.data = { Data: [(this.rowCount-1-countValidationErrors), countValidationErrors ], Labels: ["Correct Rows","Rows with Violations"],Colors:["green","red"] } as ChartDataSet;
  }

}
