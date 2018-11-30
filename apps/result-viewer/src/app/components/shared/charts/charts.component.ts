import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, Input } from '@angular/core';
import { MatListOptionChange } from '@angular/material';
import Chart from 'chart.js';

export class ChartDataSet {
  Data: number[];
  Labels: string[];
  Colors: string[];
}


@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ChartsComponent implements OnInit {


  data: ChartDataSet;
  myChart: any;
  legendDataSource: any = [];


  @ViewChild('myChart') _chart: ElementRef;

  @Input()
  public set Data(data: ChartDataSet) {
    this.data = data;
    if (this.data) {
      this.drawChart(); 
    }
  };

  @Input()
  ShowLegend: boolean = true;

  constructor() { }


  ngOnInit(): void {
    if (this.data) {
      //this._myChart.update();
    }
  }

  poolColors(a: number): string[] {
    var pool: string[] = [];
    for (let i = 0; i < a; i++) {
      pool.push(this.dynamicColors());
    }
    return pool;
  }

  dynamicColors(): string {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  drawChart() {
    let data = {
      datasets: [{
        data: this.data.Data,
        backgroundColor: this.data.Colors?this.data.Colors: this.poolColors(this.data.Data.length)
      }],

      // These labels appear in the legend and in the tooltips when hovering different arcs
      labels: this.data.Labels
    };

    this.myChart = new Chart(this._chart.nativeElement, {
      type: 'pie',
      data: data,
      options: {
        responsive: true,
        legend: {
          display: false,
          position: "right"
        }
      }
    });

    if (this.ShowLegend==true) {
      let legendDataSource = [];
      for (let i in this.data.Data) {
        legendDataSource.push({ data: this.data.Data[i], label: this.data.Labels[i], color: data.datasets[0].backgroundColor[i], index: i });
      }

      this.legendDataSource = legendDataSource;
    }

  }

  onLegendClick(opt: MatListOptionChange) {
    this.myChart.getDatasetMeta(0).data[opt.source.value].hidden = !opt.selected;
    this.myChart.update();

  }
}
