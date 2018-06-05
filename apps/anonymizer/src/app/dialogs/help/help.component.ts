import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material';



@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HelpComponent {

  public appVersion;

  constructor(public dialogRef: MatDialogRef<HelpComponent>) {
    this.appVersion = "1.0.0.0";
  }

}
