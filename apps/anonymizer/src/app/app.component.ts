import { Component, NgZone, HostBinding } from '@angular/core';

import { SettingsComponent } from './dialogs/settings/settings.component';
import { HelpComponent } from './dialogs/help/help.component';
import { ElectronService } from './services/electron.service';
import { TranslateService } from '@ngx-translate/core';

import { MatDialog } from '@angular/material';

@Component({
  selector: 'body',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @HostBinding('class') public cssClass = '';

  _theme: string;
  _isProcessing = false;
  _language
  constructor(public dialog: MatDialog, public zone: NgZone, private electronService: ElectronService, private translate: TranslateService) {

    translate.setDefaultLang('en');
    translate.use(electronService.getLanguage());

    this._theme = electronService.getTheme();
    this.setTheme();
  }

  openSettingsDialog() {
    let dialogRef = this.dialog.open(SettingsComponent, {
      height: '500px',
      width: '600px'
    });
    dialogRef.afterClosed().subscribe(() => {
      let theme = this.electronService.getTheme();
      if (theme != this._theme) {
        this._theme = theme;
        this.setTheme();
      }
      if (this.electronService.getLanguage() != this.translate.currentLang) {
        this.translate.use(this.electronService.getLanguage());
        console.log("new language:" + this.translate.currentLang);
      }
    });
  }

  openHelpDialog() {
    this.dialog.open(HelpComponent, {
      height: '350px',
      width: '600px'
    });
  }

  setTheme(){
    this.cssClass = this._theme === 'Dark' ? "unicorn-dark-theme" : "";
  }
}
