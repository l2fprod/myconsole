import { Component } from '@angular/core';
import { TagService } from './shared/index';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css']
})

export class AppComponent {

  searchText:string;

  constructor(public tagService: TagService, private route: ActivatedRoute) {
    console.log("App is starting");
  }

  ngOnInit() {
    this.route.queryParams.subscribe(queryParams => {
      console.log('Setting search field to', queryParams['q']);
      this.searchText = queryParams['q'];
      this.tagService.filterTaggables(queryParams['q']);
    });
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
