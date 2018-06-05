import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { LOCALE_ID, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ChartsComponent } from './components/shared/charts/charts.component';
import { ProcessInfoComponent } from './components/process-info/process-info.component';
import { ChartCorrectComponent } from './components/chart-correct/chart-correct.component';
import { ChartViolationsComponent } from './components/chart-violations/chart-violations.component';
import { ChartMatchesComponent } from './components/chart-matches/chart-matches.component';

import { MaterialModule } from './modules/material/material.module';

import {ProcessResultService} from './services/process-result.service';

@NgModule({
  declarations: [
    AppComponent,
    ChartsComponent,
    ProcessInfoComponent,
    ChartCorrectComponent,
    ChartViolationsComponent,
    ChartMatchesComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule
  ],
  providers: [ProcessResultService,{ provide: LOCALE_ID, useValue: 'en' }],
  bootstrap: [AppComponent]
})
export class AppModule { }
