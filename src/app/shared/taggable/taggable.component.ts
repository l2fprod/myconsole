import { Component, Input } from '@angular/core';
import { Taggable, TagService } from '../tag-service/index';

/**
 * This class represents the toolbar component.
 */
@Component({
  selector: 'sd-taggable',
  templateUrl: './taggable.component.html',
  styleUrls: ['./taggable.component.css']
})

export class TaggableComponent {

  @Input() taggable: Taggable;
  @Input() availableTags: string[];
  @Input() editable: boolean;

  @Input() showTags:boolean = false;
  @Input() showOrg:boolean = true;
  @Input() showSpace:boolean = true;

  constructor(public tagService: TagService) {
  }

  getTaggable(guid):Taggable {
    return this.tagService.getTaggable(guid);
  }

  onTagAdded(item:any) {
    this.tagService.saveTaggable(this.taggable);
    this.tagService.addTag(item);
  }

  onTagRemoved(item:any) {
    this.tagService.saveTaggable(this.taggable);
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
    return this.tagService.token != null;
  }

  enableDiego(app:Taggable) {
    this.tagService.enableDiego(app);
  }

}
