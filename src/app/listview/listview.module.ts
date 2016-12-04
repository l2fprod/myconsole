import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { ListViewComponent } from './listview.component';

@NgModule({
  declarations: [
    ListViewComponent,
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    ListViewComponent
  ]
})
export class ListViewModule { }
