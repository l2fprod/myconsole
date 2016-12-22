import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TagService, Taggable, TaggableType, TaggableViewerComponent } from '../shared/index';

@Component({
  selector: 'listview',
  templateUrl: 'listview.component.html',
  styleUrls: ['listview.component.css'],
  host: {
    'class': 'flex layout-column'
  }
})
export class ListViewComponent extends TaggableViewerComponent implements OnInit {

  selectedItem:Taggable;

  constructor(public tagService: TagService, public changeDetectorRef: ChangeDetectorRef) {
    super(tagService, changeDetectorRef);
  }

  selectItem(item:Taggable) {
    this.selectedItem = item;
  }

}
