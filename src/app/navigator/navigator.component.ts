import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TagService, Taggable, TaggableType, TaggableViewerComponent } from '../shared/index';

@Component({
  selector: 'navigator',
  templateUrl: 'navigator.component.html',
  styleUrls: ['navigator.component.css'],
  host: {
    'class': 'flex layout-column'
  }
})
export class NavigatorComponent extends TaggableViewerComponent implements OnInit {

  selectedOrganization:Taggable;
  selectedSpace:Taggable;

  constructor(public tagService: TagService, public changeDetectorRef: ChangeDetectorRef) {
    super(tagService, changeDetectorRef);
  }

  getOrganizations():Taggable[] {
    return this.tagService.getTaggablesByType(Taggable.TYPE_ORGANIZATION);
  }

  selectOrganization(org:Taggable) {
    this.selectedOrganization = org;
  }

  selectSpace(space:Taggable) {
    this.selectedSpace = space;
  }
}
