import { Component, OnInit, ViewEncapsulation, Output, ViewChild, EventEmitter, NgZone } from '@angular/core';

import { DbComponent } from '../db/db.component';
import { CsvComponent } from '../csv/csv.component';
import { OutComponent } from '../out/out.component';

import { ElectronService } from '../../services/electron.service';
import { TranslateService } from '@ngx-translate/core';

import * as moment from 'moment';

import { IDbInfo, IProcessOption, IProcessResult } from 'impilib';


@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MainComponent {

    @Output()
    public ProcessResult = new EventEmitter<boolean>();
    @Output()
    public ProcessStart = new EventEmitter<boolean>();

    @ViewChild(DbComponent)
    db: DbComponent;
    @ViewChild(CsvComponent)
    csv: CsvComponent;
    @ViewChild(OutComponent)
    out: OutComponent;

    _state: boolean[] = [false, false, false];
    _isProcessing = false;
    _time: number = 0;
    _processedRows: number = 0;
    _maxRows: number = 0;
    _eta: number = 0;
    _error: string | null;

    constructor(public zone: NgZone, private electronService: ElectronService, private translate: TranslateService) {
        this.electronService.OnBackgroundResponseRow((event: any, progess: { processedRow: number, maxRows: number }) => {
            this._processedRows = progess.processedRow;
            this._maxRows = progess.maxRows;
            this._eta = ((progess.maxRows / progess.processedRow) * this._time) - this._time;
        });
    }

    setState(index: number, isValid: boolean) {
        this._state[index] = isValid;
    }

    allValid(): boolean {
        return this._state.every((e) => e === true);
    }

    process() {

        if (this.db.DbInfo == null) return;

        this.ProcessStart.emit(true);

        const ipcRenderer = this.electronService.getIPCRenderer();
        const backgroundStartTime = +new Date();

        this._time = 0;
        this._error = null;

        let options: IProcessOption = {
            DbVersion: this.db.DbInfo.Version,
            DbPeriodFrom: new Date(this.db.DbInfo.PeriodFrom).valueOf(),
            DbPeriodTo: new Date(this.db.DbInfo.PeriodTo).valueOf(),
            CsvRowCount: this.csv.RowCount,
            CsvEncoding: "", //get from appsettings
            CsvSeparator: "",//get from appsettings
            DatabaseFile: "",//get from appsettings
            InputCsvFile: "",//get from appsettings
            OutputPath: "",//get from appsettings
            SedexSenderId:""//get from appsettings
        };


        ipcRenderer.send('background-start', options);

        this._isProcessing = true;
        let timer = setInterval(() => {
            if (!this._isProcessing) {
                clearInterval(timer);
                return;
            }
            this._time = +new Date() - backgroundStartTime;
        }, 1000);

        ipcRenderer.once('background-response', (event: any, result: IProcessResult) => {
            this.zone.run(() => {
                //console.log(JSON.stringify(result));
                this._isProcessing = false;
                if (result.Error) {
                    this._error = result.Error.message;
                    this.translate.get('Main.Error').subscribe((res: string) => {
                        console.log("error notify");
                        new Notification(res, { body: result.Error.message });
                    });

                } else {
                    this.translate.get('Main.Finished').subscribe((f: string) => {
                        this.translate.get('Main.Duration').subscribe((d: string) => {
                            new Notification(f, { body: d + moment(this._time).format("mm:ss") });
                        });
                    });
                }
                this.ProcessResult.emit(true);
            });
        });
    }

    getProgressValue() {
        return (this._processedRows * 100) / this._maxRows;
    }

    getTime() {
        return moment.utc(moment.duration(this._time).asMilliseconds()).format("HH:mm:ss");
    }

    getEta() {
        return moment.utc(moment.duration(this._eta).asMilliseconds()).format("HH:mm:ss");
    }


}
