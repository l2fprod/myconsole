import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TagService, Taggable, TaggableType, TaggableViewerComponent } from '../shared/index';

@Component({
  selector: 'browser',
  templateUrl: 'browser.component.html',
  styleUrls: ['browser.component.css'],
  host: {
    'class': 'flex layout-column'
  }
})
export class BrowserComponent extends TaggableViewerComponent implements OnInit {

  constructor(public tagService: TagService, public changeDetectorRef: ChangeDetectorRef) {
    super(tagService, changeDetectorRef);
  }

  getOrganizations():Taggable[] {
    return this.getTaggableByType(Taggable.TYPE_ORGANIZATION);
  }

  getSpaces():Taggable[] {
    return this.getTaggableByType(Taggable.TYPE_SPACE);
  }

  getApplications():Taggable[] {
    return this.getTaggableByType(Taggable.TYPE_APPLICATION);
  }

  getServices():Taggable[] {
    return this.getTaggableByType(Taggable.TYPE_SERVICE_INSTANCE);
  }

}
