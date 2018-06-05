import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, NgZone } from '@angular/core';

import { ElectronService } from '../../services/electron.service';

@Component({
    selector: 'app-out',
    templateUrl: './out.component.html',
    styleUrls: ['./out.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class OutComponent implements OnInit {

    _path: string;
    _settings: any;

    _isValid: boolean;

    @Input()
    public defaultFile: string;
    @Input()
    public disabled: boolean;

    @Output()
    public isValid = new EventEmitter<boolean>();

    constructor(public zone: NgZone, private electronService: ElectronService) {
        this._settings = this.electronService.getSettings();

        this._isValid = false;
    }

    ngOnInit(): void {
        this._path = this._settings.get('AppSettings.OutDirectory');
        this.verifyFile();
    }


    selectedFile(mypath: string) {
        this._path = mypath;
        //Verify File
        this.verifyFile();

        //Store in Settings
        this._settings.set('AppSettings.OutDirectory', mypath);
    }

    verifyFile() {
        this.electronService.VerifyPath(this._path, (valid: boolean) => {
            this.zone.run(() => {
                this._isValid = valid;
                this.isValid.emit(this._isValid);
            });
        });
    }

    shortPath() {
        if (this._path.length > 20) {
            return "..." + this._path.substring(this._path.length - 20);
        }
        return this._path;
    }

}
