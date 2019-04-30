import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';

import {ILogResult,IProcessOption} from 'impilib';

import * as moment from 'moment';

@Component({
  selector: 'app-process-info',
  templateUrl: './process-info.component.html',
  styleUrls: ['./process-info.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProcessInfoComponent implements OnInit {

  result:ILogResult;

  endTime:string;
  startTime:string;
  dbPeriodFrom:string;
  dbPeriodTo:string;
  duration:string

  @Input()
  set ProcessResult(result:ILogResult){
    this.result=result;
    if (!result) return;
    this.endTime=this.formatDateTime(result.Meta.StartTime,"HH:mm:ss");
    this.startTime=this.formatDateTime(result.Meta.EndTime,"HH:mm:ss");
    this.dbPeriodFrom=this.formatDateTime(result.Meta.DbPeriodFrom,"DD.MM.YYYY");
    this.dbPeriodTo=this.formatDateTime(result.Meta.DbPeriodTo,"DD.MM.YYYY");
    this.duration=moment.utc(moment.duration(result.Meta.EndTime-result.Meta.StartTime).asMilliseconds()).format("H[h] m[m] ss[s]");
  }

  constructor() { }

  ngOnInit() {
  }

  formatDateTime(milis:number,format:string){
    return moment(milis).format(format);
  }

}
