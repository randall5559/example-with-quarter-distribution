import {
  Component,
  Inject,
  OnInit
} from '@angular/core';
import {
  DistributedRatioFactory,
  DistributedRatioServiceToken,
  DistributedRatio
} from './services/example-quarter-ratio.service';


interface Quarter {
  value: number;
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public totalValues = 0;
  public someFakeValues: Quarter[] = [
    { value: 10 },
    { value: 20 },
    { value: 20 },
    { value: 20 },
    { value: 20 },
    { value: 10 }
  ];


  /**
   * Creates an instance of AppComponent.
   * @param {DistributedRatio} DistributedRatioService
   * @memberof AppComponent
   */
  constructor(
    @Inject(DistributedRatioServiceToken) private DistributedRatioService: DistributedRatio
  ) {}


  /**
   * OnInit LifeCycle
   *
   * @memberof AppComponent
   */
  public ngOnInit() {
    // set the default total
    this.totalValues = this.totalQuarters();
  }


  /**
   * Handle the value of the changed total
   *
   * @param {any} event
   * @memberof AppComponent
   */
  public onTotalChange(event) {
    const value = Number(event.currentTarget.value);

    if (event.currentTarget.id === 'total') {
      // distribute values across quarters
      this.someFakeValues = <Quarter[]>this.someFakeValues
        .map(this.DistributedRatioService.mapQuarterValuesFromTotalValue(value))
        .map(this.DistributedRatioService.mapRemainderToQuarters(value));
    }
  }


  /**
   * Update and total quarters
   *
   * @private
   * @param {any} [index=null]
   * @param {any} [quarterValue=null]
   * @returns
   * @memberof AppComponent
   */
  private totalQuarters() {
    // sum total all quarters
    return this.someFakeValues
      .map((qrt: Quarter) => qrt.value)
      .reduce((pre, curr) => Number(pre) + Number(curr));
  }
}
