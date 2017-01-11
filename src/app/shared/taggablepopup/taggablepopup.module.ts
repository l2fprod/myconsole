import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '@angular/material';
import { TaggablePopupComponent } from './taggablepopup.component';

@NgModule({
  imports: [
    FormsModule,
    MaterialModule,
    CommonModule
  ],
  declarations: [
    TaggablePopupComponent
  ],
  exports: [
    TaggablePopupComponent
  ]
})
export class TaggablePopupModule { }
