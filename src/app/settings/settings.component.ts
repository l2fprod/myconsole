import { Angulartics2 } from 'angulartics2';
import { Component, ChangeDetectorRef } from '@angular/core';
import { TagService, TaggableViewerComponent } from '../shared/index';

@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent extends TaggableViewerComponent {

  constructor(public tagService: TagService, public changeDetectorRef: ChangeDetectorRef, private stats: Angulartics2) {
    super(tagService, changeDetectorRef);
  }

  getToken() {
    return this.tagService.getToken();
  }

  getDecodedToken() {
    return this.tagService.getDecodedToken();
  }

  setToken(token:string) {
    this.stats.eventTrack.next({ action: 'set-token', properties: { category: 'Actions' }});
    this.tagService.setToken(token);
  }

}
