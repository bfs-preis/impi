import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { ElectronService } from '../../services/electron.service';


@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HelpComponent {

  public appVersion;

  constructor(public dialogRef: MatDialogRef<HelpComponent>,private electronService: ElectronService) {
    this.appVersion = electronService.getAppVersion();
  }

}
