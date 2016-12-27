import { Component, Input } from '@angular/core';
import { Taggable, TagService } from '../tag-service/index';

/**
 * This class represents the toolbar component.
 */
@Component({
  selector: 'sd-taggableoverview',
  templateUrl: './taggableoverview.component.html',
  styleUrls: ['./taggableoverview.component.css'],
  host: {
    'class': 'layout-column'
  }
})

export class TaggableOverviewComponent {

  @Input() taggable: Taggable;

  constructor(private tagService:TagService) {
  }

  onTagAdded(item:string) {
    this.tagService.saveTaggable(this.taggable);
    this.tagService.addTag(item);
  }

  onTagRemoved(item:string) {
    this.tagService.saveTaggable(this.taggable);
  }

}
