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

    Promise.all([this.processResultService.GetProcessResult(), this.processResultService.GetShowAllValidationErrors()])
      .then((values) => {
        let r: IProcessResult = values[0];
        let flag: boolean = values[1];

        if (flag === false) {
          r.Violations = r.Violations.filter((v) => { return (v.RedFlag === true); });
        }
        r.Violations=r.Violations.sort((a,b)=> {return a.Id-b.Id});
        this.processResult = r;
      });

    /*this.processResultService.GetProcessResult().then((r:IProcessResult)=>{
      this.processResult = r;
    });*/

    /*this.processResultService.GetShowRedFlags((data)=>{
      console.log(data);
    });*/
  }

  ngOnInit(): void {


  }
}
