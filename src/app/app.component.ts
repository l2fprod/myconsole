import { Component } from '@angular/core';
import { TagService } from './shared/index';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css']
})

export class AppComponent {

  constructor(public tagService: TagService) {
    console.log("App is starting");
  }

  filterTaggables(text:string) {
    this.tagService.filterTaggables(text);
  }

  setToken(token:string) {
    this.tagService.setToken(token);
  }

  refreshApps() {
    this.tagService.refreshApps();
  }

  refreshAll() {
    this.tagService.refreshAll();
  }

}
