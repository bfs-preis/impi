import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { ChartDataSet } from '../shared/charts/charts.component';

enum MatchingTypeEnum {
  PointMatching = 0,
  CenterStreetMatching = 1,
  CenterCommunitiesMatching = 2,
  NoMatching = 3,
  NoMatchingWithError = 4,
}

@Component({
  selector: 'app-chart-matches',
  templateUrl: './chart-matches.component.html',
  styleUrls: ['./chart-matches.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ChartMatchesComponent implements OnInit {

  data: ChartDataSet
  matches: number[];

  @Input()
  set Matches(m:  number[]) {
    this.matches = m;
    if (this.matches) {
      this.prepareData();
    }
  }
  constructor() { }

  ngOnInit() {
  }

  prepareData(): void {

    let data=this.matches.map((v, i) => {
      return { Text: MatchingTypeEnum[i], Count: v };
    });
    this.data = { Data: data.map((r) => r.Count), Labels: data.map((r) => r.Text) } as ChartDataSet;
  }

}
