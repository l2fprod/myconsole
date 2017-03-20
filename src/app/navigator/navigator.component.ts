import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TagService, Taggable, TaggableType, TaggableViewerComponent } from '../shared/index';

@Component({
  selector: 'navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.css'],
  host: {
    'class': 'flex layout-column'
  }
})
export class NavigatorComponent extends TaggableViewerComponent implements OnInit {

  selectedOrganization:Taggable;
  selectedSpace:Taggable;
  selectedItem:Taggable;

  constructor(public tagService: TagService, public changeDetectorRef: ChangeDetectorRef) {
    super(tagService, changeDetectorRef);
    this.selectDefault();
  }

  getOrganizations():Taggable[] {
    return this.tagService.getFilteredTaggablesByType(Taggable.TYPE_ORGANIZATION);
  }

  selectOrganization(org:Taggable) {
    this.selectedOrganization = org;
    this.selectedSpace = null;
    this.selectedItem = null;
  }

  selectSpace(space:Taggable) {
    this.selectedSpace = space;
    this.selectedItem = null;
  }

  selectItem(item:Taggable) {
    this.selectedItem = item;
  }

  getSpaces() {
    return this.selectedOrganization ? this.tagService.applyFilter(this.selectedOrganization.children['spaces']) : [];
  }

  getApps():Taggable[] {
    return this.selectedSpace ? this.tagService.applyFilter(this.selectedSpace.children['apps']) : []
  }

  getServices():Taggable[] {
    return this.selectedSpace ? this.tagService.applyFilter(this.selectedSpace.children['services']) : []
  }

  onNewTaggables(taggables:Taggable[]) {
    super.onNewTaggables(taggables);
    this.selectDefault();
  }

  private selectDefault() {
    this.selectOrganization(null);

    const orgs = this.getOrganizations();
    if (orgs.length > 0) {
      this.selectOrganization(orgs[0]);
    }

    const spaces = this.getSpaces();
    if (spaces.length > 0) {
      this.selectSpace(spaces[0]);
    }
  }
}
