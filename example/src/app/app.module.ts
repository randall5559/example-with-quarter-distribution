import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { DistributedRatioFactory, DistributedRatioServiceToken } from './services/example-quarter-ratio.service';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    { provide: DistributedRatioServiceToken, useFactory: DistributedRatioFactory }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
