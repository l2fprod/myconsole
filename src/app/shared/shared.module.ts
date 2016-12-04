import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TagService } from './tag-service/index';
import { MaterialModule } from '@angular/material';
import { TaggableModule } from './taggable/taggable.module';

@NgModule({
  imports: [ MaterialModule, TaggableModule ],
  declarations: [ ],
  exports: [ MaterialModule, FormsModule, TaggableModule ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [ TagService ]
    };
  }
}
