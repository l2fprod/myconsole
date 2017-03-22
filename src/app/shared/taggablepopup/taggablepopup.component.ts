import { Component, Input } from '@angular/core';
import { Taggable, TagService } from '../tag-service/index';

/**
 * This class represents the toolbar component.
 */
@Component({
  selector: 'sd-taggablepopup',
  templateUrl: './taggablepopup.component.html',
  styleUrls: ['./taggablepopup.component.css']
})

export class TaggablePopupComponent {

  @Input() taggable: Taggable;

  constructor(public tagService: TagService) {
  }

  stopApp(app:Taggable) {
    this.tagService.stopApp(app);
  }

  startApp(app:Taggable) {
    this.tagService.startApp(app);
  }

  killFirstAppInstance(app:Taggable) {
    this.tagService.killFirstAppInstance(app);
  }

  hasToken() {
    return this.tagService.getToken() != null;
  }

  enableDiego(app:Taggable) {
    this.tagService.enableDiego(app);
  }

}
