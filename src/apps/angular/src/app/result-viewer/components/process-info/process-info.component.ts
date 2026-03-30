import { Component, ViewEncapsulation, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ILogResult } from '../../models';
import moment from 'moment';

@Component({
  selector: 'app-process-info',
  templateUrl: './process-info.component.html',
  styleUrls: ['./process-info.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, TranslateModule]
})
export class ProcessInfoComponent {

  result!: ILogResult;
  endTime!: string;
  startTime!: string;
  dbPeriodFrom!: string;
  dbPeriodTo!: string;
  duration!: string;

  @Input()
  set ProcessResult(result: ILogResult) {
    this.result = result;
    if (!result?.Meta) return;
    this.endTime = this.formatDateTime(result.Meta.EndTime, 'HH:mm:ss');
    this.startTime = this.formatDateTime(result.Meta.StartTime, 'HH:mm:ss');
    this.dbPeriodFrom = this.formatDateTime(result.Meta.DbPeriodFrom, 'DD.MM.YYYY');
    this.dbPeriodTo = this.formatDateTime(result.Meta.DbPeriodTo, 'DD.MM.YYYY');
    this.duration = moment.utc(moment.duration(result.Meta.EndTime - result.Meta.StartTime).asMilliseconds()).format('H[h] m[m] ss[s]');
  }

  formatDateTime(millis: number, format: string): string {
    return moment(millis).format(format);
  }
}
