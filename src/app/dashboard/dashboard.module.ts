import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { DashboardComponent } from './dashboard.component';
import {nvD3} from 'ng2-nvd3'

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [DashboardComponent, nvD3]
})
export class DashboardModule { }
