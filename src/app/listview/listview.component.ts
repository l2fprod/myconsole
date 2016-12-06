import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TagService, Taggable, TaggableType, TaggableViewerComponent } from '../shared/index';

@Component({
  selector: 'listview',
  templateUrl: 'listview.component.html',
  styleUrls: ['listview.component.css'],
})
export class ListViewComponent extends TaggableViewerComponent implements OnInit {

  constructor(public tagService: TagService, public changeDetectorRef: ChangeDetectorRef) {
    super(tagService, changeDetectorRef);
  }

}
