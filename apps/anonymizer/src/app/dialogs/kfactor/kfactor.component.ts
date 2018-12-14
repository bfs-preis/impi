import { Component, OnInit, ViewEncapsulation, NgZone } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { ElectronService } from '../../services/electron.service';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-kfactor',
  templateUrl: './kfactor.component.html',
  styleUrls: ['./kfactor.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class KfactorComponent implements OnInit {

  _started: boolean;

  _error: string;
  _check: boolean | null;

  constructor(public dialogRef: MatDialogRef<KfactorComponent>,
    private electronService: ElectronService,
    public zone: NgZone,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this._started = false;
    this._check=null;
  }

  ngOnInit(): void {

  }

  checkKFactor() {
    this._started = true;
    this._check=null
    this.electronService.CheckKFactor(this.data.file, (check: boolean | null, err: Error) => {
      this.zone.run(() => {
        if (err) {
          this._error = err.message;
          this._check=false;
        }
        else {
          this._check = check;
          console.log('check set: ' + this._check);
        }
        this._started = false;
      });
    });
  }

}
