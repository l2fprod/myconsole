import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '@angular/material';
import { TaggableOverviewComponent } from './taggableoverview.component';
import { TagInputModule } from 'ng2-tag-input';

@NgModule({
  imports: [
    FormsModule,
    MaterialModule,
    CommonModule,
    TagInputModule
  ],
  declarations: [
    TaggableOverviewComponent
  ],
  exports: [
    TaggableOverviewComponent
  ]
})
export class TaggableOverviewModule { }
