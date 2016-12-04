import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { BrowserComponent } from './browser.component';

@NgModule({
  declarations: [
    BrowserComponent,
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    BrowserComponent
  ]
})
export class BrowserModule { }
