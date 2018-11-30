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

  colors:string[]=['#400000', '#e53939', '#a62c00', '#ff4400', '#cc8166', '#664133', '#cc6d00', '#8c5b23', '#f2d6b6', '#4c3300', '#ffaa00', '#b2982d', '#eeff00', '#677339', '#2e331a', '#e1ffbf', '#44ff00', '#0a4d00', '#009914', '#3df285', '#4d996b', '#26332d', '#004d3d', '#40fff2', '#009ba6', '#607980', '#acdae6', '#004466', '#80c4ff', '#2d62b3', '#001180', '#333366', '#8080ff', '#4400ff', '#291040', '#7c30bf', '#a98fbf', '#ee00ff', '#590053', '#f279ea', '#bf0080', '#8c697c', '#ff0066', '#661a38', '#ffbfd9', '#8c0025', '#f27989', '#332628'];

  @Input()
  set Matches(m:  number[]) {
    this.matches = m;
    if (this.matches) {
      this.matches=this.matches.slice(0,5);
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
    this.data = { Data: data.map((r) => r.Count), Labels: data.map((r) => r.Text),Colors:this.colors } as ChartDataSet;
  }

}
