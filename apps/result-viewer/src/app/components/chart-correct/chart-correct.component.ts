import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { ChartDataSet } from '../shared/charts/charts.component';
import { IViolation } from 'impilib';

@Component({
  selector: 'app-chart-correct',
  templateUrl: './chart-correct.component.html',
  styleUrls: ['./chart-correct.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ChartCorrectComponent implements OnInit {

  data: ChartDataSet
  violations: IViolation[];
  rowCount: number = 0;

  @Input()
  set Violations(v: IViolation[]) {
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
    //get correct rows
    let correctRows: IViolation = this.violations.find((v) => v.Id == 1000);
    if (!correctRows) return;
    this.data = { Data: [correctRows.Rows.length, (this.rowCount-correctRows.Rows.length) ], Labels: ["Correct Rows","Rows with Violations"],Colors:["green","red"] } as ChartDataSet;
  }

}
