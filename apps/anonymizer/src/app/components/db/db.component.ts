import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, NgZone } from '@angular/core';
import { IDbInfo } from 'impilib';

import { ElectronService } from '../../services/electron.service';
import { MatDialog } from '@angular/material';

import { KfactorComponent } from '../../dialogs/kfactor/kfactor.component';

@Component({
    selector: 'app-db',
    templateUrl: './db.component.html',
    styleUrls: ['./db.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DbComponent implements OnInit {

    _file: string;
    _settings: any;
    _sqlliteFilter: { name: string, extensions: string[] }[] = [];
    _isValid: boolean;

    _version: string;
    _period: string;
    _error: string;

    @Input()
    public defaultFile: string;
    @Input()
    public disabled: boolean;

    @Output()
    public isValid = new EventEmitter<boolean>();

    public DbInfo: IDbInfo | null;

    constructor(public dialog: MatDialog, public zone: NgZone, private electronService: ElectronService) {
        this._settings = this.electronService.getSettings();
        this._sqlliteFilter = [
            { name: 'db', extensions: ['db'] },
            { name: 'All Files', extensions: ['*'] }
        ];
        this._isValid = false;
    }

    ngOnInit(): void {
        this._file = this._settings.get('AppSettings.DBFile');
        this.verifyFile();
    }

    selectedFile(file: string) {
        this._file = file;
        //Verify File
        this.verifyFile();

        //Store in Settings
        this._settings.set('AppSettings.DBFile', file);
    }

    verifyFile() {

        this.electronService.VerifyDatabase(this._file, (dbInfo: IDbInfo, err: Error) => {
            this.zone.run(() => {
                if (err) {
                    this._isValid = false;
                    this._version = "";
                    this._period = "";
                    this._error = err.message;
                }
                else {
                    this.DbInfo = dbInfo;
                    this._isValid = true;
                    this._version = dbInfo.Version;
                    this._period = new Date(dbInfo.PeriodFrom).toLocaleDateString() + "-" + new Date(dbInfo.PeriodTo).toLocaleDateString();
                    this._error = "";
                }
                this.isValid.emit(this._isValid);
            });
        });
    }

    getFileName() {
        return this._file.replace(/^.*[\\\/]/, '');
    }

    checkKFactor() {
        console.log("checkKFactor");

        this.dialog.open(KfactorComponent, {
            width: '600px',
            disableClose: true,
            data: {
                file: this._file,
            }
        });
    }

}
