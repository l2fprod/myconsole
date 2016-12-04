import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef  } from '@angular/core';
import { TagService, Taggable, TaggableType, TaggableFilterFactory } from '../index';

export class TaggableViewerComponent implements OnInit {

  private tagServiceSubscription: any;

  availableTags: string[] = [];
  editable: boolean = false;


  /**
   * @param {TagService} tagService - The injected TagService.
   */
  constructor(public tagService: TagService, public cd: ChangeDetectorRef) {}

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
  }

  ngOnDestroy() {
    console.log('Unregistering TagService listener');
    this.tagServiceSubscription.unsubscribe();
  }

  getTaggableTypes():TaggableType[] {
    return Taggable.TYPES;
  }

  getTaggableByType(type:TaggableType):Taggable[] {
    return this.tagService.getTaggableByType(type);
  }

  getAvailableTags() {
    this.tagService.getTags()
      .subscribe(
        tags => this.availableTags = tags
      );
  }

}
