import { Component, Input } from '@angular/core';
import { Taggable, TagService } from '../tag-service/index';

/**
 * This class represents the toolbar component.
 */
@Component({
  selector: 'sd-taggable',
  templateUrl: 'taggable.component.html',
  styleUrls: ['taggable.component.css']
})

export class TaggableComponent {

  @Input() taggable: Taggable;
  @Input() availableTags: string[];
  @Input() editable: boolean;

  constructor(public tagService: TagService) {
  }

  getTaggable(guid):Taggable {
    return this.tagService.getTaggable(guid);
  }

  onTagAdded(item:string) {
    this.tagService.saveTaggable(this.taggable);
    this.tagService.addTag(item);
  }

  onTagRemoved(item:string) {
    this.tagService.saveTaggable(this.taggable);
  }
}
