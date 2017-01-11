import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '@angular/material';
import { TaggableComponent } from './taggable.component';
import { TagInputModule } from 'ng2-tag-input';
import { TaggablePopupModule } from '../taggablepopup/taggablepopup.module';

@NgModule({
  imports: [
    FormsModule,
    MaterialModule,
    CommonModule,
    TagInputModule,
    TaggablePopupModule,
  ],
  declarations: [
    TaggableComponent
  ],
  exports: [
    TaggableComponent
  ]
})
export class TaggableModule { }
