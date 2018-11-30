import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import {ElectronService} from '../../services/electron.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SettingsComponent {

  _settings: any;

  _selectedEncoding: string;
  _selectedSeparater: string;
  _selectedTheme: string;
  _selectedLanguage:string;
  _selectedSedexSenderId:string;
  encodings = [
    'utf8',
    'ansi',
    'macintosh'
  ];

  constructor(public dialogRef: MatDialogRef<SettingsComponent>,private electronService: ElectronService,public translate:TranslateService) {
    this._settings = electronService.getSettings();

    this._selectedEncoding = this._settings.get('AppSettings.CSVEncoding');
    this._selectedSeparater = this._settings.get('AppSettings.CSVSeparater');
    this._selectedTheme = this._settings.get('AppSettings.Theme');
    this._selectedLanguage=this._settings.get('AppSettings.Language');
    this._selectedSedexSenderId=this._settings.get('AppSettings.SedexSenderId');

    console.log(this._selectedSedexSenderId);

  }

  getResult() {
    return {
      CSVEncoding: this._selectedEncoding,
      CSVSeparater: this._selectedSeparater,
      Theme: this._selectedTheme,
      Language:this._selectedLanguage,
      SedexSenderId:this._selectedSedexSenderId
    };
  }

  saveResult() {
    this._settings.set('AppSettings.CSVEncoding', this._selectedEncoding);
    this._settings.set('AppSettings.CSVSeparater', this._selectedSeparater);
    this._settings.set('AppSettings.Theme', this._selectedTheme);
    this._settings.set('AppSettings.Language',this._selectedLanguage);
    this._settings.set('AppSettings.SedexSenderId',this._selectedSedexSenderId);
    console.log(this._selectedSedexSenderId);
  }

}
