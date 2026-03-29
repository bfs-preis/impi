import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import Chart from 'chart.js/auto';

export class ChartDataSet {
  Data!: number[];
  Labels!: string[];
  Colors!: string[];
}

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatListModule]
})
export class ChartsComponent implements OnInit {

  data!: ChartDataSet;
  myChart: Chart | null = null;
  legendDataSource: any[] = [];

  @ViewChild('myChart', { static: true }) _chart!: ElementRef;

  @Input()
  public set Data(data: ChartDataSet) {
    this.data = data;
    if (this.data) {
      this.drawChart();
    }
  }

  @Input()
  ShowLegend = true;

  constructor() { }

  ngOnInit(): void { }

  poolColors(a: number): string[] {
    const pool: string[] = [];
    for (let i = 0; i < a; i++) {
      pool.push(this.dynamicColors());
    }
    return pool;
  }

  dynamicColors(): string {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  drawChart(): void {
    if (this.myChart) {
      this.myChart.destroy();
    }

    const bgColors = this.data.Colors ? this.data.Colors : this.poolColors(this.data.Data.length);

    const data = {
      datasets: [{
        data: this.data.Data,
        backgroundColor: bgColors
      }],
      labels: this.data.Labels
    };

    this.myChart = new Chart(this._chart.nativeElement, {
      type: 'pie',
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
            position: 'right'
          }
        }
      }
    });

    if (this.ShowLegend === true) {
      const legendDataSource = [];
      for (const i in this.data.Data) {
        legendDataSource.push({
          data: this.data.Data[i],
          label: this.data.Labels[i],
          color: bgColors[i],
          index: i
        });
      }
      this.legendDataSource = legendDataSource;
    }
  }

  onLegendClick(index: number, selected: boolean): void {
    if (this.myChart) {
      const meta = this.myChart.getDatasetMeta(0);
      if (meta.data[index]) {
        (meta.data[index] as any).hidden = !selected;
        this.myChart.update();
      }
    }
  }
}
