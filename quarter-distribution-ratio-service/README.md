# Quarter Distribution Ratio Service
A TypeScript Class used to standardize the relationship between quarters and their total values
1. [Details](#details)
   1. [Concept](#concept)
   2. [Logic &amp; Assumptions](#logic--assumptions)
2. [Basic Usage](#basic-usage)
   1. [Install](#install)
   2. [Mapping the Total to the Quarters](#mapping-the-total-to-the-quarters)
   3. [Mapping the Total and Handling the Remainders](#mapping-the-total-and-handling-the-remainders)
3. [Configuring the Service](#configuring-the-service)
   1. [Config Options (all optional)](#config-options-all-optional)
4. [Using with AngularJS and Angular X](#using-with-angularjs-and-angular-x)
   1. [Using with AngularJS (ng1) - coming soon](#using-with-ng1)
   2. [Using with ngX (Angular > 1)](#using-with-ngx-angular--1)


<br><br><br>

# Details

### Concept
This (framework independent) class/service is designed to help with the distribution of a total value across its quarters using the existing values to determine the distribution ratio, excluding quarters with a value of 0.

Here is a simple example:
```
let quarters = [
  {quater: 1, value: 20, ...},
  {quater: 2, value: 10, ...},
  {quater: 3, value: 5, ...},
  {quater: 4, value: 15, ...}
];
// total is by default the sum of the quarter values: 50


/**
 * if we wanted to change the total and have it distribute amongst the available
 * quarters we would want to use the existing ratio to determine which quarter gets  * what.
 */

// if the new total is 100, then we would expect the quarters to be:
let quarters = [
  {quater: 1, value: 40, ...},
  {quater: 2, value: 20, ...},
  {quater: 3, value: 10, ...},
  {quater: 4, value: 30, ...}
];
```

In addition to helping with distribution it also has a method for handling remainders if a whole value is the end goal.

### Logic &amp; Assumptions

This service is opinionated in a few areas to enforce a consistent approach to distributing a value across 1 or more quarters (yes, more!). Here are some of its 'rules':
 - if all the quarters have a value of 0, it will use the default ratio rules or the override provided to the constructor
 - by default it will use Math.floor to handle and decimal places, this can be overridden using the constructor
 - it has a separate method for handling the remainder after doing the initial redistribution:
    - the remainder method will take the difference between the sum of the quarters and the target total (new total)
    - the remainder is applied one by one to each quarter, starting with the first quarter a value greater than 0 and skipping ay quarters with a value of 0
    - if there is a remainder greater than the number of quarters greater than 0, then the additional remainder will be applied to the first quarter to have a value greater than 0

<br><br><br>

## Basic Usage
#### Install
```
npm install quarter-distribution-ratio-service --save
```

#### Mapping the Total to the Quarters
```
/**
 * Defaults:
 *  - assumes a model with 4 quarters
 *  - uses a default ratio of .25 for each quarter (if all quarters are 0)
 *  - will use Math.floor() to round the quarter values
 *  - assumes the quarter objects have a property called 'value'
 */
let service = new DistributedRatio();
let quarters = [{value: 0},{value: 0},{value: 0},{value: 0}];
let result = quarters.map(service.mapQuarterValuesFromTotalValue(240));

// result: [{value: 60},{value: 60},{value: 60},{value: 60}]
```

#### Mapping the Total and Handling the Remainders
```
/**
 * Defaults:
 *  - assumes a model with 4 quarters
 *  - uses a default ratio of .25 for each quarter (if all quarters are 0)
 *  - will use Math.floor() to round the quarter values
 *  - assumes the quarter objects have a property called 'value'
 */

// create the service
let service = new DistributedRatio();

// quarter objects
let quarters = [{value: 0},{value: 0},{value: 0},{value: 0}];

// updated quarter collection, with remainders applied using our rules
let result = quarters
  .map(service.mapQuarterValuesFromTotalValue(242))
  .map(service.mapRemainderToQuarters(242));

// result: [{value: 61},{value: 61},{value: 60},{value: 60}]
```
<br><br><br>

## Configuring the Service
This service can be configured using the constructor. The interface for the configuration object is:
```
{
  numberOfQtrs?: number = 4,
  qtrDefaults?: number[] = [.25, .25, .25, .25],
  remainderStrategy?: 'floor' | 'round' | 'ceil' | 'none' = 'floor',
  qtrValKey?: string = 'value'
}

/**
 * Examples...
 */

// expects a collection of 7 quarters, and will dynamically create the default ratios
// by dividing the number of quarters by 1
let service = new DistributedRatio({
  numberOfQtrs: 7
});

// expects 6 quarters and will use the supplied ratio scheme for each quarter
let service = new DistributedRatio({
  numberOfQtrs: 6,
  qtrDefaults: [0, .25, .25, .25, .25, 0]
});

// will not do anything with converting the numbers to whole numbers
let service = new DistributedRatio({
  remainderStrategy: 'none'
});

// will expect the value for each quarter object to be on the 'fake_val' property
let service = new DistributedRatio({
  qtrValKey: 'fake_val'
});
```
Each config option is optional, and if supplied will overwrite the defaults. The defaults are depicted above.

#### Config Options (all optional)

##### `numberOfQtrs: number`
The default is set to 4, but this can be any number greater than 1. Note that if you are using this feature with the `qtrDefaults` option, you'll want to make sure the number of quarters is equal to the length of the `qtrDefaults` collection.

> **Using without `qtrDefaults`**<br>
> If you only supply the number of quarters, and omit the `qtrDefaults`, it will
> auto create the default ratios for you.
<br><br>

##### `qtrDefaults: number[]`
These are the default ratio's to use when all the quarters are 0.

If this configuraiton is omitted, then the service will determine the default based on the `numberOfQtrs` value. See `numberOfQtrs` section about what happens when you omit this value (which is supported).
<br><br>

##### `remainderStrategy: 'floor' | 'round' | 'ceil' | 'none'`
This config tells the service how to round &emdash; or not &emdash; the quarter values. The default is Math.floor(). If `'none'` is used then the numbers will be floats.
<br><br>

##### `qtrValKey: string`
This is the key/property the service will look for on the quarter Object to get the value for the quarter. The default is `'value'`, but can be any allowed property name for an Object.
<br><br>


## Using with AngularJS and Angular X
#### Using with NG1
Coming soon...

#### Using with NGX (Angular > 1)

To use with Angular *X* we recommend using the **factory provider pattern**. Here is an example of creating a service for use with ngx apps:
```

/** file: ./quarter-ratio.service.ts */

// import the token service
import { InjectionToken } from '@angular/core'; // note, in ng2 this is the OpaqueToken

// import the Distributed Ratio Service and Config Interface
import { DistributedRatio, DistributedRatioConfig } from 'quarter-distribution-ratio-service';

// to make your life easier, export above so you only have to reference one file when using you local service
export * from 'quarter-distribution-ratio-service';

// create and export the token for angular to use
export const DistributedRatioServiceToken = new InjectionToken<DistributedRatio>('DistributedRatioService');

// export the factory function to use when creating the provider
export function DistributedRatioFactory() {
  return new DistributedRatio(<DistributedRatioConfig>{
    numberOfQtrs: 4,
    qtrDefaults: [.25, .25, .25, .25],
    qtrValKey: 'value',
    remainderStrategy: 'floor'
  });
}
```

<br><br><br>
Inside of your app.modules (or **any module file** for that matter) add the **provider** to the `NgModule` decorator:
```

/** file: ./app.module.ts */

...

import { DistributedRatioFactory, DistributedRatioServiceToken } from './quarter-ratio.service';

...

@NgModule({
  declarations: [...],
  imports: [...],
  providers: [
    { provide: DistributedRatioServiceToken, useFactory: DistributedRatioFactory }
  ],
  bootstrap: [...]
})
export class AppModule { }

```

<br><br><br>
**Injecting** it into a component or service would look like this:
```
import { ..., Inject } from '@angular/core';

import {
  DistributedRatioFactory,
  DistributedRatioServiceToken,
  DistributedRatio
} from './quarter-ratio.service';

...

export class AppComponent {

  constructor (
    @Inject(DistributedRatioServiceToken) private DistributedRatioService: DistributedRatio
  ) {}

  ...

  public someMethod() {
    this.quarters = this.quarters
        .map(DistributedRatioService.mapQuarterValuesFromTotalValue(this.new_total))
        .map(DistributedRatioService.mapRemainderToQuarters(this.new_total));
  }

}

```