import { Component, OnInit, Input, Output, EventEmitter, NgZone, ViewEncapsulation } from '@angular/core'

import { ElectronService } from '../../services/electron.service';

@Component({
    selector: 'app-csv',
    templateUrl: './csv.component.html',
    styleUrls: ['./csv.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CsvComponent implements OnInit {

    _file: string;
    _settings: any;
    _csvFilter: { name: string, extensions: string[] }[] = [];
    _isValid: boolean;
    _error: string;

    public RowCount: number = 0;

    @Input()
    public defaultFile: string;
    @Input()
    public disabled: boolean;

    @Output()
    public isValid = new EventEmitter<boolean>();

    constructor(public zone: NgZone, private electronService: ElectronService) {
        this._settings = this.electronService.getSettings();
        this._csvFilter = [
            { name: 'csv', extensions: ['csv'] },
            { name: 'All Files', extensions: ['*'] }
        ];
        this._isValid = false;
    }

    ngOnInit(): void {
        this._file = this._settings.get('AppSettings.CSVFile');
        this.verifyFile();
    }


    selectedFile(file: string) {
        this._file = file;
        //Verify File
        this.verifyFile();

        //Store in Settings
        this._settings.set('AppSettings.CSVFile', file);

    }

    verifyFile() {

        this.electronService.VerifyCsv({ file: this._file, delimiter: this._settings.get('AppSettings.CSVSeparater') }, (rows: number, err: Error) => {
            this.zone.run(() => {
                if (err) {
                    this._error = err.message;
                    this.RowCount = 0;
                    this._isValid = false;
                } else {
                    this.RowCount = rows;
                    this._isValid = true;
                    this._error="";
                }
                console.log("verifyFile");
                this.isValid.emit(this._isValid);
            });
        });
    }



    getFileName() {
        return this._file.replace(/^.*[\\\/]/, '')
    }

}
