import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TagService, Taggable, TaggableType, TaggableFilterFactory, Region } from '../index';

export class TaggableViewerComponent implements OnInit {

  private tagServiceSubscription: any;

  availableTags: string[] = [];
  editable: boolean = false;


  /**
   * @param {TagService} tagService - The injected TagService.
   */
  constructor(public tagService: TagService, public changeDetectorRef: ChangeDetectorRef) {}

  /**
   * Get the names OnInit
   */
  ngOnInit() {
    this.getAvailableTags();
    console.log('Registering TagService listener');
    this.tagServiceSubscription = this.tagService.asObservable().subscribe(taggables => {
      this.onNewTaggables(taggables);
    });
  }

  onNewTaggables(taggables:Taggable[]) {
    console.log('New taggables!');
    this.changeDetectorRef.markForCheck();
  }

  ngOnDestroy() {
    console.log('Unregistering TagService listener');
    this.tagServiceSubscription.unsubscribe();
  }

  getRegions():Region[] {
    return TagService.REGIONS;
  }

  getTaggableTypes():TaggableType[] {
    return Taggable.TYPES;
  }

  getTaggableByType(type:TaggableType):Taggable[] {
    return this.tagService.getFilteredTaggablesByType(type);
  }

  getTaggablesMatching(text:string):Taggable[] {
    return this.tagService.getFilteredTaggablesMatching(text);
  }

  getAvailableTags() {
    this.tagService.getTags()
      .subscribe(
        tags => this.availableTags = tags
      );
  }

}
