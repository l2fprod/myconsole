import { Component } from '@angular/core';
import { TagService } from './shared/index';
import { ActivatedRoute } from '@angular/router';
import { Angulartics2GoogleAnalytics } from 'angulartics2';
import {DomSanitizer} from '@angular/platform-browser';
import {MdIconRegistry} from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  searchText:string;

  constructor(
    public tagService: TagService,
    private route: ActivatedRoute,
    private stats: Angulartics2GoogleAnalytics,
    mdIconRegistry: MdIconRegistry, sanitizer: DomSanitizer
  ) {
    console.log("App is starting");
    mdIconRegistry.addSvgIcon('github', sanitizer.bypassSecurityTrustResourceUrl('/assets/github-circle.svg') as string);
    mdIconRegistry.addSvgIcon('twitter', sanitizer.bypassSecurityTrustResourceUrl('/assets/twitter.svg') as string);
    mdIconRegistry.addSvgIcon('view_chart', sanitizer.bypassSecurityTrustResourceUrl('/assets/view-chart.svg') as string);
    mdIconRegistry.addSvgIcon('view_grid', sanitizer.bypassSecurityTrustResourceUrl('/assets/view-grid.svg') as string);
    mdIconRegistry.addSvgIcon('tag', sanitizer.bypassSecurityTrustResourceUrl('/assets/tag.svg') as string);
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

  isRefreshing() {
    return this.tagService.refreshing;
  }

  refreshApps() {
    this.tagService.refreshApps();
  }

  refreshAll() {
    this.tagService.refreshAll();
  }

}
