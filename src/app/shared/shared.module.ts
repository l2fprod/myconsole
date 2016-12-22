import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TagService } from './tag-service/index';
import { MaterialModule } from '@angular/material';
import { TaggableModule } from './taggable/taggable.module';
import { TaggableOverviewModule } from './taggableoverview/taggableoverview.module';
import { Angulartics2Module } from 'angulartics2';

@NgModule({
  imports: [ MaterialModule, TaggableModule, TaggableOverviewModule, Angulartics2Module.forChild() ],
  declarations: [ ],
  exports: [ MaterialModule, FormsModule, TaggableModule, TaggableOverviewModule ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [ TagService ]
    };
  }
}
