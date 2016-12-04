import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { SettingsComponent } from './settings.component';

@NgModule({
  declarations: [
    SettingsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    SettingsComponent
  ]
})
export class SettingsModule { }
