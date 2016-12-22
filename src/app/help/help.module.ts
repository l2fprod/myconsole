import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { HelpComponent } from './help.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    HelpComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([]),
  ],
  exports: [
    HelpComponent
  ]
})
export class HelpModule { }
