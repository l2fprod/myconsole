import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';
import { JwtHelper } from 'angular2-jwt';
import { Taggable, TaggableType } from './taggable';
import { TaggableFilter, TaggableFilterFactory, AcceptAllFilter } from './taggablefilter';
import { environment } from '../../../environments';
import { Router } from '@angular/router';
import { parallelLimit } from 'async';
import { LocalStorageService } from 'angular-2-local-storage';

import * as PouchDB from 'pouchdb';
declare let require: any;
PouchDB.plugin(require('pouchdb-find'));

export class Region {
  constructor(public name: string, public display: string, public icon:string) { }
}


@Injectable()
export class TagService {

  private _taggablesDb: any;
  private _tagsDb: any;

  private _taggables:Taggable[] = [];
  private _filteredTaggables:Taggable[] = [];
  private _filteredByTypes: Taggable[][] = [];
  private _filter:TaggableFilter = new AcceptAllFilter();
  private _filterText:string = "";

  private _observable:Observable<Taggable[]>;
  private _observer: Observer<Taggable[]>;

  public refreshing: boolean = false;
  public refreshStatus: any = { }

  private jwtHelper: JwtHelper = new JwtHelper();
  private token: string;
  private decodedToken:any;

  public static REGIONS = environment.regions.map(region =>
    new Region(region.id, region.label, region.flag));

  /**
   * @param {Http} http - The injected Http.
   * @constructor
   */
  constructor(private http: Http, private router: Router,
              private localStorageService: LocalStorageService) {
    console.log('Initializing TagService...');
    this._observable = new Observable(observer =>
      this._observer = observer).share();

    this._taggablesDb = new PouchDB('taggables', { auto_compaction: true });
    this._tagsDb = new PouchDB('tags', { auto_compaction: true });
    console.log(this._taggablesDb, this._tagsDb);

    this.addIndex(this._taggablesDb, [ 'type' ]);
    this.addIndex(this._taggablesDb, [ 'tags' ]);

    this.setToken(localStorageService.get('token') as string);

    this.loadTaggables(null);
  }

  asObservable() {
    return this._observable;
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
  addTag(tag: any) {
    this._tagsDb.put({ _id: tag.value || tag })
      .then((response: any) => {
        console.log('New tag saved', response);
      })
      .catch(this.handleError);
  }

  getTags(): Observable<string[]> {
    return <Observable<string[]>>Observable.fromPromise(this._tagsDb.allDocs({ include_docs: true})
      .then((docs:any) => {
        return docs.rows.map((row:any) => row.doc._id);
      })
      .catch(this.handleError));
  }

  filterTaggables(text:string) {
    if (text === this._filterText) {
      console.warn('Filter did not change, ignoring request...');
      return;
    }

    console.log('Setting filter to', text);
    this._filter = TaggableFilterFactory.buildFilter(text, true);
    this._filterText = text;
    this.updateFilteredTaggables();

    // capture the query in the url parameters
    this.router.navigate([], {queryParams:{q:text}});
  }

  getFilteredTaggablesMatchingByType(type:TaggableType, filter:TaggableFilter):Taggable[] {
    return this.getFilteredTaggablesByType(type).filter(taggable => filter.accept(taggable));
  }

  getFilteredTaggablesMatching(text:string):Taggable[] {
    const filter = TaggableFilterFactory.buildFilter(text, false);
    return this._filteredTaggables.filter(taggable => filter.accept(taggable));
  }

  getFilteredTaggablesByType(type:TaggableType):Taggable[] {
    if (!this._filteredByTypes[type.name]) {
      console.log('Filtering by type', type.name);
      this._filteredByTypes[type.name] = this._filteredTaggables.filter(taggable => (type.name === taggable.type));
      console.log('Got', this._filteredByTypes[type.name].length, type.plural);
    }
    return this._filteredByTypes[type.name];
  }

  getTaggablesByType(type:TaggableType):Taggable[] {
    return this._taggables.filter(taggable => type.name === taggable.type);
  }

  applyFilter(taggables:Taggable[]):Taggable[] {
    return taggables.filter(taggable => this._filter.accept(taggable));
  }

  getToken():string {
    return this.token;
  }

  getDecodedToken():any {
    return this.decodedToken;
  }

  private decodeToken(token:string) {
    this.decodedToken = this.jwtHelper.decodeToken(token);
    this.decodedToken.iat = new Date(this.decodedToken.iat * 1000);
    this.decodedToken.exp = new Date(this.decodedToken.exp * 1000);
    console.log('Decoded token', this.decodedToken);
  }

  setToken(token:string):boolean {
    console.log('Setting token to', token);

    try {
      // remove any carriage return in the token
      const sanitizedToken = token.replace(/\r?\n|\r/g, '').trim();
      this.decodeToken(sanitizedToken);
      this.token = sanitizedToken;
      this.localStorageService.set('token', token);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    };

  }

  isTokenExpired():boolean {
    return this.getToken() != null && this.decodedToken.exp.getTime() < new Date().getTime();
  }

  stopApp(app:Taggable) {
    this.makePut(app.region, `/v2/apps/${app.target.metadata.guid}`, { state: 'STOPPED' });
  }

  startApp(app:Taggable) {
    this.makePut(app.region, `/v2/apps/${app.target.metadata.guid}`, { state: 'STARTED' });
  }

  enableDiego(app:Taggable) {
    this.makePut(app.region, `/v2/apps/${app.target.metadata.guid}`, { diego: true });
  }

  killFirstAppInstance(app:Taggable) {
    this.makeDelete(app.region, `/v2/apps/${app.target.metadata.guid}/instances/0`);
  }

  refreshApps() {
    console.log('Refreshing apps...');
    this.refreshSome({
      '/v2/organizations': 'organization',
      '/v2/spaces': 'space',
      '/v2/apps': 'app',
    });
  }

  refreshAll() {
    console.log('Refreshing all resources...');
    this.refreshSome({
      '/v2/organizations': Taggable.TYPE_ORGANIZATION,
      '/v2/spaces': Taggable.TYPE_SPACE,
      '/v2/apps': Taggable.TYPE_APPLICATION,
      '/v2/service_instances': Taggable.TYPE_SERVICE_INSTANCE,
      '/v2/service_plans': Taggable.TYPE_SERVICE_PLAN,
      '/v2/services': Taggable.TYPE_SERVICE,
      '/v2/routes': Taggable.TYPE_ROUTE,
      '/v2/route_mappings': Taggable.TYPE_ROUTE_MAPPING,
      '/v2/domains': Taggable.TYPE_DOMAIN
    });
  }

  private refreshSome(calls) {
    const self = this;
    this.refreshStatus = {
      byRegion: {},
      messages: [],
      database: 'new',
      cleanup: 'new',
      filter: 'new'
    };

    const fetchTasks = [];
    const fetchedObjects:Taggable[] = [];
    TagService.REGIONS.forEach(region => {
      self.refreshStatus.byRegion[region.name] = { region: region, types: {} };
      Object.keys(calls).forEach(key => {
        fetchTasks.push(this.makeFetchTask(region, key, calls[key].name, fetchedObjects));
        self.refreshStatus.byRegion[region.name].types[calls[key].name] = {
          type: calls[key],
          state: 'new'
        };
      });
    });

    // it is starting!
    this.refreshing = true;

    parallelLimit(fetchTasks, 10, (err, result) => {
      if (err) {
        console.log('Fetch error', err);
        self.refreshing = false;
      } else {
        console.log('Fetched all', fetchedObjects.length, 'objects');
        const start = Promise.resolve();

        self.refreshStatus.database = 'inprogress';

        start.then(function() {
          return Promise.all(fetchedObjects.map(taggable => self.addTaggable(taggable)));
        }).then(function(retrievedTaggables:Taggable[]) {
          console.log('All done!');

          // reload taggables
          self.loadTaggables(fetchedObjects).then(function() {
            console.log('Refresh complete!');
            self.refreshing = false;
          }, function() {
            self.refreshing = false;
          });
        }).catch(function() {
          self.refreshing = false;
        });
      }
    });
  }

  private makeDelete(region: string, call:string) {
    const apiRoot = environment.apiUrl;
    const path = apiRoot + '/' + region +  call;
    const headers = new Headers({
      'Authorization': this.token
    });
    const options = new RequestOptions({ headers: headers });
    console.log('DELETE', path);
    this.http.delete(path, options)
      .map((res: Response) => res.json())
      .catch(this.handleError)
      .subscribe((body) => console.log('Received', body));
  }

  private makePut(region: string, call:string, payload:any) {
    const apiRoot = environment.apiUrl;
    const path = apiRoot + '/' + region +  call;
    const headers = new Headers({
      'Authorization': this.token
    });
    const options = new RequestOptions({ headers: headers });
    console.log('PUT', path);
    this.http.put(path, payload, options)
      .map((res: Response) => res.json())
      .catch(this.handleError)
      .subscribe((body) => console.log('Received', body));
  }

  private makeFetchTask(region: Region, call: string, type: string, fetchedObjects:Taggable[]) {
    const self = this;
    return function(callback) {
      self.refreshStatus.byRegion[region.name].types[type].state = 'inprogress';
      const apiRoot = environment.apiUrl;
      const path = apiRoot + '/' + region.name +  call; //'?call=' + encodeURIComponent(call);

      console.log('Fetching', path, type);
      const headers = new Headers({
        'Authorization': self.token
      });
      const options = new RequestOptions({ headers: headers });
      self.http.get(path, options)
        .map((res: Response) => {
          let response = res.json();
          let results = response.resources;
          console.log('Received', results.length, 'taggables');

          results.forEach((item: any) => {
            fetchedObjects.push(Taggable.newTaggable(type + '-' + item.metadata.guid, type, [], item, region.name));
          });

          if (response.next_url) {
            console.log('Preparing for more data to retrieve', response.next_url);
            self.makeFetchTask(region, response.next_url, type, fetchedObjects)(callback);
          } else {
            self.refreshStatus.byRegion[region.name].types[type].state = 'done';
            callback(null);
          }
        })
        .catch(callback)
        .subscribe((taggables: Taggable[]) => { console.log('Completed', region, call, type)});
    };
  }

  private updateFilteredTaggables() {
    this._filteredTaggables = this._taggables.filter(taggable => this._filter.accept(taggable));
    console.log('Kept', this._filteredTaggables.length, 'taggables after filtering');
    this._filteredByTypes = [];
    if (this._observer) {
      this._observer.next(this._filteredTaggables);
    }
  }

  private loadTaggables(retrievedTaggables:Taggable[]) {
    const self = this;
    self.refreshStatus.database = 'inprogress';
    console.log('Querying db...');
    return this._taggablesDb.find({
      selector: {
        type: { $exists: true }
      }
    }).then((result: any) => {
      self.refreshStatus.database = 'done';
      console.log('Found', result.docs.length, 'taggables');
      let loadedTaggables = result.docs.map((doc:any) => Taggable.fromDoc(doc));

      let toBeUpdated:Taggable[] = [];
      if (retrievedTaggables) {
        self.refreshStatus.cleanup = 'inprogress';
        console.log('Identifying deleted taggables');
        const retrievedTaggablesById = {};
        retrievedTaggables.forEach(taggable => {
          retrievedTaggablesById[taggable._id] = taggable._rev;
        });

        loadedTaggables.forEach(taggable => {
          if (!retrievedTaggablesById[taggable._id]) {
            taggable.markForDeletion();
            toBeUpdated.push(taggable);
            console.log(taggable._id, taggable.getName(), 'no longer exists');
          }
        });
        // remove the deleted objects from the items we consider
        loadedTaggables = loadedTaggables.filter((taggable) => !taggable._deleted);
        console.log('After cleanup,', loadedTaggables.length, 'taggables remain');
      }

      console.log('Sorting taggables');
      loadedTaggables.sort((a:Taggable, b:Taggable):number => {
        return a.compareTo(b);
      });

      const lookupTaggable = function(guid:string) {
        return loadedTaggables.find(taggable => taggable.target.metadata.guid === guid);
      }

      console.log('Resolving all taggable links');
      loadedTaggables.forEach((taggable: Taggable) => taggable.resolveLinks(lookupTaggable));

      console.log('Merging duplicate items');
      loadedTaggables.forEach((taggable: Taggable) => {
        toBeUpdated = toBeUpdated.concat(taggable.mergeDuplicates(this));
      });

      loadedTaggables = loadedTaggables.filter((taggable) => !taggable._deleted);
      this._taggables = loadedTaggables;

      console.log('Updating', toBeUpdated.length, 'items');
      return Promise.all(toBeUpdated.map(taggable => self.updateTaggable(taggable)));
    }).then(() => {
      self.refreshStatus.cleanup = 'done';
      console.log('Kept', this._taggables.length, 'taggables');
      console.log('Updating filtered taggables');
      self.refreshStatus.filter = 'inprogress';
      this.updateFilteredTaggables();
      self.refreshStatus.filter = 'done';
    }).catch((err) => {
      console.log(err);
    });
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

  updateTaggable(item: Taggable):any {
    return this._taggablesDb.put(item)
      .then((result:any) => console.log('Updated', item.getName()))
      .catch(this.handleError);
  }

  private addTaggable(item: Taggable):any {
    return this._taggablesDb.get(item._id)
      .then((doc: any) => {
        // doc already exists, capture the rev
        item._rev = doc._rev;

        if (JSON.stringify(item.target) === JSON.stringify(doc.target)) {
          // no change, ignore it
          // console.log('No change for', item._id);
        } else {
          item.mergeWith(doc);
          console.log('Updating', item._id);
          this._taggablesDb.put(item);
        }

        return item;
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
