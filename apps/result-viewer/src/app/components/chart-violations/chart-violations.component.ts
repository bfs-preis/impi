import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { ChartDataSet } from '../shared/charts/charts.component';
import { IViolation } from 'impilib';

@Component({
  selector: 'app-chart-violations',
  templateUrl: './chart-violations.component.html',
  styleUrls: ['./chart-violations.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ChartViolationsComponent implements OnInit {

  data: ChartDataSet
  violations: IViolation[];

  @Input()
  set Violations(v: IViolation[]) {
    this.violations = v;
    if (this.violations) {
      this.prepareData();
    }
  }
  constructor() { }

  ngOnInit() {
  }

  prepareData(): void {

    //filter correct rows
    let data: IViolation[] = this.violations.filter((v) => v.Id != 1000);

    //sort data
    data.sort((v1, v2) => v1.Id - v2.Id);

    this.data = { Data: data.map((r) => r.Rows.length), Labels: data.map((r) => r.Text) } as ChartDataSet;
  }

}
