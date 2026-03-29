import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultViewerRoutingModule } from './result-viewer-routing.module';

import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';

import { MainComponent } from './components/main/main.component';
import { ChartsComponent } from './components/shared/charts/charts.component';
import { ChartCorrectComponent } from './components/chart-correct/chart-correct.component';
import { ChartMatchesComponent } from './components/chart-matches/chart-matches.component';
import { ChartViolationsComponent } from './components/chart-violations/chart-violations.component';
import { ProcessInfoComponent } from './components/process-info/process-info.component';
import { ProcessResultService } from './services/process-result.service';

@NgModule({
  imports: [
    CommonModule,
    ResultViewerRoutingModule,
    MatTabsModule,
    MatExpansionModule,
    MatListModule,
    // Standalone components
    MainComponent,
    ChartsComponent,
    ChartCorrectComponent,
    ChartMatchesComponent,
    ChartViolationsComponent,
    ProcessInfoComponent,
  ],
  providers: [
    ProcessResultService,
  ]
})
export class ResultViewerModule { }
