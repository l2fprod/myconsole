import { Component } from '@angular/core';
import { TagService } from './shared/index';
import { ActivatedRoute } from '@angular/router';
import { Angulartics2GoogleAnalytics } from 'angulartics2';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css']
})
export class AppComponent {

  searchText:string;

  constructor(public tagService: TagService, private route: ActivatedRoute, private stats: Angulartics2GoogleAnalytics) {
    console.log("App is starting");
  }

  ngOnInit() {
    this.route.queryParams.subscribe(queryParams => {
      console.log('Setting search field to', queryParams['q']);
      this.searchText = queryParams['q'];
      this.tagService.filterTaggables(queryParams['q']);
    });
  }

  hasToken() {
    return this.tagService.token != null;
  }

  filterTaggables(text:string) {
    this.tagService.filterTaggables(text);
  }

  refreshApps() {
    this.tagService.refreshApps();
  }

  refreshAll() {
    this.tagService.refreshAll();
  }

}
