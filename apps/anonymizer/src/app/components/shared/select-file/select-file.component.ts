import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, ViewChild } from '@angular/core';

import { ElectronService } from '../../../services/electron.service';
import { TranslateService } from '@ngx-translate/core';

export enum DialogType {
  OpenFile,
  SaveDirectory
}

@Component({
  selector: 'app-select-file',
  templateUrl: './select-file.component.html',
  styleUrls: ['./select-file.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SelectFileComponent {

  @Input()
  public buttonText: string = "Durchsuchen";

  @Input()
  public dialogType: DialogType = DialogType.OpenFile;

  @Input()
  public defaultPath: string;

  @Input()
  public disabled: boolean;

  @Output()
  public selected = new EventEmitter<string>();

  @Input()
  public filters: { name: string, extensions: string[] }[] = [
    { name: 'All Files', extensions: ['*'] }
  ];

  @ViewChild("divfocus") divfocus: any;

  constructor(private electronService: ElectronService, private translate: TranslateService) {
  }

  buttonClicked(): void {
    this.divfocus.nativeElement.focus();
    const { dialog } = this.electronService.getRemote();

    let selectedObjects: string[] = [];

    if (this.dialogType == DialogType.OpenFile) {
      selectedObjects = dialog.showOpenDialog({
        properties: ['openFile'], filters: this.filters, defaultPath: this.defaultPath
      });
    }
    else if (this.dialogType == DialogType.SaveDirectory) {
      selectedObjects = dialog.showOpenDialog({
        properties: ['openDirectory'], defaultPath: this.defaultPath

      });
    }

    if (selectedObjects != null)
      this.selected.emit(selectedObjects[0]);
  }

  getIcon() {
    if (this.dialogType == DialogType.OpenFile) {
      return "insert_drive_file";
    }
    else if (this.dialogType == DialogType.SaveDirectory) {
      return "folder open";
    }
    return "check";
  }

}
