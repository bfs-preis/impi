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

  colors:string[]=['#400000', '#e53939', '#a62c00', '#ff4400', '#cc8166', '#664133', '#cc6d00', '#8c5b23', '#f2d6b6', '#4c3300', '#ffaa00', '#b2982d', '#eeff00', '#677339', '#2e331a', '#e1ffbf', '#44ff00', '#0a4d00', '#009914', '#3df285', '#4d996b', '#26332d', '#004d3d', '#40fff2', '#009ba6', '#607980', '#acdae6', '#004466', '#80c4ff', '#2d62b3', '#001180', '#333366', '#8080ff', '#4400ff', '#291040', '#7c30bf', '#a98fbf', '#ee00ff', '#590053', '#f279ea', '#bf0080', '#8c697c', '#ff0066', '#661a38', '#ffbfd9', '#8c0025', '#f27989', '#332628'];


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
    let selColors= data.map((v)=>{
        return this.colors[v.Id-1];
    });
    //sort data
    data.sort((v1, v2) => v1.Id - v2.Id);

    this.data = { Data: data.map((r) => r.Rows.length), Labels: data.map((r) => r.Text),Colors: selColors } as ChartDataSet;
  }

}
