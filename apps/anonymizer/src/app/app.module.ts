import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { MaterialModule } from './modules/material/material.module';
import { MatDialog, MatDialogRef } from '@angular/material';

import { AppComponent } from './app.component';

import { DbComponent } from './components/db/db.component';
import { CsvComponent } from './components/csv/csv.component';
import { OutComponent } from './components/out/out.component';
import { MainComponent } from './components/main/main.component';

import { SelectFileComponent } from './components/shared/select-file/select-file.component';

import { SettingsComponent } from './dialogs/settings/settings.component';
import { HelpComponent } from './dialogs/help/help.component';

import { ElectronService } from './services/electron.service';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  imports: [FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    })
  ],
  declarations: [
    AppComponent,
    SelectFileComponent,
    DbComponent,
    CsvComponent,
    OutComponent,
    MainComponent,
    SettingsComponent,
    HelpComponent],
  bootstrap: [AppComponent],
  providers: [ElectronService],
  entryComponents: [SettingsComponent, HelpComponent]
})
export class AppModule { }
