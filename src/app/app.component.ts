import { Component, trigger, style, animate, transition } from '@angular/core';
import { TagService, TaggableType, Region, Taggable } from './shared/index';
import { ActivatedRoute } from '@angular/router';
import { Angulartics2GoogleAnalytics } from 'angulartics2';
import {DomSanitizer} from '@angular/platform-browser';
import {MdIconRegistry} from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('refreshStatus', [
      transition('void => *', [
        style({ opacity: 0, transform: 'translate(-50%, -100%)' }),
        animate(250)
      ]),
      transition('* => void', [
        style({ opacity: 1 }),
        animate(500)
      ])
    ])
  ]
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
    return this.tagService.getToken() != null;
  }

  isTokenExpired() {
    return this.tagService.isTokenExpired();
  }

  clearSearch() {
    this.tagService.filterTaggables('');
  }

  filterTaggables(text:string) {
    this.tagService.filterTaggables(text);
  }

  isRefreshing() {
    return this.tagService.refreshing;
  }

  getStatus() {
    return this.tagService.refreshStatus;
  }

  getRegions():Region[] {
    return TagService.REGIONS;
  }

  getTaggableTypes():TaggableType[] {
    return Taggable.ALL_TYPES;
  }

  refreshApps() {
    this.tagService.refreshApps();
  }

  refreshAll() {
    this.tagService.refreshAll();
  }

}
