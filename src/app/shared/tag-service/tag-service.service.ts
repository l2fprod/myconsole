import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';
import { Taggable, TaggableType } from './taggable';
import { TaggableFilter, TaggableFilterFactory, AcceptAllFilter } from './taggablefilter';
import { environment } from '../../../environments';

import * as PouchDB from 'pouchdb';
declare let require: any;
PouchDB.plugin(require('pouchdb-find'));

export class Region {
  constructor(public name: string, public display: string, public icon:string) { }
}


@Injectable()
export class TagService {

  private _observable:Observable<Taggable[]>;
  private _observer: Observer<Taggable[]>;

  private token: string;

  private _taggablesDb: any;
  private _tagsDb: any;

  private _taggables:Taggable[] = [];
  private _filteredTaggables:Taggable[] = [];
  private _filteredByTypes: Taggable[][] = [];
  private _filter:TaggableFilter = new AcceptAllFilter();

  public static REGIONS = [
    new Region('ng', 'US South', 'us'),
    new Region('eu-gb', 'United Kingdom', 'gb'),
    new Region('au-syd', 'Sydney', 'au')
  ];

  /**
   * @param {Http} http - The injected Http.
   * @constructor
   */
  constructor(private http: Http) {
    console.log('Initializing TagService...');
    this._observable = new Observable(observer =>
      this._observer = observer).share();

    this._taggablesDb = new PouchDB('taggables');
    this._tagsDb = new PouchDB('tags');
    console.log(this._taggablesDb, this._tagsDb);

    this.addIndex(this._taggablesDb, [ 'type' ]);
    this.addIndex(this._taggablesDb, [ 'tags' ]);

    this.loadTaggables();
  }

  asObservable() {
    return this._observable;
  }

  filterTaggables(text:string) {
    this._filter = TaggableFilterFactory.buildFilter(text);
    this._filteredTaggables = this._taggables.filter(taggable => this._filter.accept(taggable));
    this._filteredByTypes = [];
    if (this._observer) {
      this._observer.next(this._filteredTaggables);
    }
  }

  getFilteredTaggableByType(type:TaggableType, filter:TaggableFilter):Taggable[] {
    return this.getTaggableByType(type).filter(taggable => filter.accept(taggable));
  }

  getTaggablesMatching(text:string):Taggable[] {
    const filter = TaggableFilterFactory.buildFilter(text);
    return this._filteredTaggables.filter(taggable => filter.accept(taggable));
  }

  getTaggableByType(type:TaggableType):Taggable[] {
    if (!this._filteredByTypes[type.name]) {
      console.log('Filtering by type', type.name);
      this._filteredByTypes[type.name] = this._filteredTaggables.filter(taggable => (type.name === taggable.type));
      console.log('Got', this._filteredByTypes[type.name].length, type.plural);
    }
    return this._filteredByTypes[type.name];
  }

  setToken(token:string) {
    console.log('Setting token to', token);
    this.token = token;
  }

  refreshApps() {
    console.log('Refreshing resources...');
    TagService.REGIONS.forEach(region => {
      this.fetchTaggables(region, '/v2/organizations', 'organization');
      this.fetchTaggables(region, '/v2/spaces', 'space');
      this.fetchTaggables(region, '/v2/apps', 'app');
    });
  }

  refreshAll() {
    console.log('Refreshing resources...');
    TagService.REGIONS.forEach(region => {
      this.fetchTaggables(region, '/v2/organizations', 'organization');
      this.fetchTaggables(region, '/v2/spaces', 'space');
      this.fetchTaggables(region, '/v2/apps', 'app');
      this.fetchTaggables(region, '/v2/service_instances', 'service_instance');
      this.fetchTaggables(region, '/v2/service_plans', 'service_plan');
      this.fetchTaggables(region, '/v2/services', 'service');
    });
  }

  private loadTaggables() {
    console.log('Querying db...');
    this._taggablesDb.find({
      selector: {
        type: { $exists: true }
      }
    }).then((result: any) => {
      console.log('Found', result.docs.length, 'taggables');
      this._taggables = result.docs.map((doc:any) => Taggable.fromDoc(doc));
      console.log('Mapped all taggables');
      this._taggables.forEach((taggable: Taggable) => taggable.resolveLinks(this));
      console.log('Resolved all links');
      this._taggables.sort((a:Taggable, b:Taggable):number => {
        return a.compareTo(b);
      });
      console.log('Sorted all taggables');
      this._filteredTaggables = this._taggables;
      this._filteredByTypes = [];
      if (this._observer) {
        this._observer.next(this._filteredTaggables);
      }
    }).catch((err) => {
      console.log(err);
    });
  }

  getTaggables():Taggable[] {
    return this._filteredTaggables;
  }

  getTaggable(guid:string):Taggable {
    return this._taggables.find(taggable => taggable.target.metadata.guid === guid);
  }

  saveTaggable(taggable: Taggable) {
    this._taggablesDb.put(taggable)
      .then((response: any) => {
        console.log('Saved', response);
        // update our local revision for future updates
        taggable._rev = response.rev;
      })
      .catch(this.handleError);
  }

  /**
   * Records the tag so it can be customized, reused in autocompletion
   */
  addTag(tag: string) {
    this._tagsDb.put({ _id: tag })
      .then((response: any) => {
        console.log('New tag saved', response);
      })
      .catch(this.handleError);
  }

  getTags(): Observable<string[]> {
    return <Observable<string[]>>Observable.fromPromise(this._tagsDb.allDocs({ include_docs: true})
      .then((docs:any) => {
        console.log('Found', docs.rows, 'tags');
        return docs.rows.map((row:any) => row.doc._id);
      })
      .catch(this.handleError));
  }


  private fetchTaggables(region: Region, call: string, type: string): any {
    const apiRoot = environment.apiUrl;
    const path = apiRoot + '/' + region.name +  call; //'?call=' + encodeURIComponent(call);

    console.log('Fetching', path, type);
    const headers = new Headers({
      'Authorization': this.token
    });
    const options = new RequestOptions({ headers: headers });
    this.http.get(path, options)
      .map((res: Response) => {
        let response = res.json();
        let results = response.resources;
        console.log('Received', results.length, 'taggables');

        if (response.next_url) {
          console.log('Preparing for more data to retrieve', response.next_url);
          this.fetchTaggables(region, response.next_url, type);
        }

        return results.map((item: any) => {
          return Taggable.newTaggable(type + '-' + item.metadata.guid, type, [], item, region.name);
        });
      })
      .catch(this.handleError)
      .subscribe(
        (taggables: Taggable[]) => taggables.forEach(taggable => this.addTaggable(taggable))
      );
  }

  private addIndex(db:any, fields:string[]) {
    db.createIndex({
      index: {
        fields: fields
      }
    }).then(function (result:any) {
      console.log('Index on fields', fields, result);
    }).catch(this.handleError);
  }

  private addTaggable(item: Taggable) {
    this._taggablesDb.get(item._id)
      .then((doc: any) => {
        // doc already exists
        //PENDING(fredL) update if it is more recent
        item._id = doc._id;
        item._rev = doc._rev;
        //PENDING(fredL) need to merge the tags!!!
        console.log('Updating', item._id);
        this._taggablesDb.put(item);
      })
      .catch((err: any) => {
        if (err.status == 404) {
          console.log('Adding', item._id);
          this._taggablesDb.put(item);
        } else {
          console.log(err);
        }
      });
  }

  /**
    * Handle HTTP error
    */
  private handleError (error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }
}
