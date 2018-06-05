import { Component, OnInit } from '@angular/core';
import { ProcessResultService } from './services/process-result.service';
import { IProcessResult } from 'impilib';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  processResult: IProcessResult | null;

  constructor(private processResultService: ProcessResultService) {
    this.processResultService.GetProcessResult().then((r)=> this.processResult=r);
  }

  ngOnInit(): void {

    
  }
}
