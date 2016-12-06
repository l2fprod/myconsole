import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { NavigatorComponent } from './navigator.component';

@NgModule({
  declarations: [
    NavigatorComponent,
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    NavigatorComponent
  ]
})
export class NavigatorModule { }
