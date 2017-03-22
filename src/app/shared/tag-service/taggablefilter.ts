import { Taggable, Application, ServiceInstance } from './taggable';

function containsIgnoreCase(text:string, searchValue:string):boolean {
  return text.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0;
}

export interface TaggableFilter {
  accept(taggable:Taggable):boolean;
}

export class NotFilter implements TaggableFilter {
  constructor(private filter:TaggableFilter) {}
  accept(taggable:Taggable):boolean {
    return !this.filter.accept(taggable);
  }
}

export class AcceptAllFilter implements TaggableFilter {
  accept(taggable:Taggable):boolean {
    return true;
  }
}

export class CompoundFilter implements TaggableFilter {
  constructor(private filters:TaggableFilter[], private includeParents:boolean) {}
  accept(taggable:Taggable):boolean {
    let match = true;
    for (let i = 0, c = this.filters.length; i < c; i++) {
      if (!this.filters[i].accept(taggable)) {
        match = false;
      }
    }

    // if we need to include parents in the filtering results,
    // we check if any child of this taggable match the filter
    if (!match && this.includeParents) {
      match = this.acceptedByChildren(taggable, this);
    }

    return match;
  }
  private acceptedByChildren(taggable:Taggable, filter:TaggableFilter):boolean {
    return Object.keys(taggable.children)
      .find((key:string) =>
        taggable.children[key].find((taggable:Taggable) => filter.accept(taggable)) !== undefined) !== undefined;
  }
  toString():string {
    return this.filters.toString();
  }
}

export class TextFilter implements TaggableFilter {
  constructor(private text:string) {}
  accept(taggable:Taggable):boolean {
    try {
      return (taggable.target.entity.name && containsIgnoreCase(taggable.target.entity.name, this.text))
        || taggable.tags.indexOf(this.text)>=0
        || taggable.region.indexOf(this.text)>=0;
    } catch(err) {
      console.log(err);
      return true;
    }
  }
  toString():string {
    return this.text;
  }
}

export class TypeFilter implements TaggableFilter {
  constructor(private type:string) {}
  accept(taggable:Taggable):boolean {
    return taggable.type === this.type;
  }
  toString():string {
    return 'type:' + this.type;
  }
}

export class TagFilter implements TaggableFilter {
  constructor(private tag:string) {}
  accept(taggable:Taggable):boolean {
    return taggable.tags.find((item) => {
      if (item.value) {
        return containsIgnoreCase(item.value, this.tag);
      } else {
        return containsIgnoreCase(item, this.tag);
      }
    }) != null;
  }
  toString():string {
    return 'tag:' + this.tag;
  }
}

export class DiegoFilter implements TaggableFilter {
  constructor(private hasDiego:boolean) {}
  accept(taggable:Taggable):boolean {
    return taggable.type === Taggable.TYPE_APPLICATION.name &&
    taggable.target.entity.diego === this.hasDiego;
  }
  toString():string {
    return 'diego:' + this.hasDiego;
  }
}

export class UrlFilter implements TaggableFilter {
  constructor(private url:string) {}
  accept(taggable:Taggable):boolean {
    return taggable.type === Taggable.TYPE_APPLICATION.name &&
    (taggable as Application).getAppUrls().find(url => containsIgnoreCase(url, this.url)) != null;
  }
  toString():string {
    return 'url:' + this.url;
  }
}
export class OrganizationFilter implements TaggableFilter {
  constructor(private org:string) {
    this.org = org.toLowerCase();
  }
  accept(taggable:Taggable):boolean {
    try {
      return (taggable.type === 'organization' &&
         containsIgnoreCase(taggable.target.entity.name, this.org))
         || containsIgnoreCase(taggable.links['org'].target.entity.name, this.org);
    } catch(err) {
      return false;
    }
  }
  toString():string {
    return 'org:' + this.org;
  }
}

export class SpaceFilter implements TaggableFilter {
  constructor(private space:string) {
    this.space = space.toLowerCase();
  }
  accept(taggable:Taggable):boolean {
    try {
      return (taggable.type === 'space' &&
         containsIgnoreCase(taggable.target.entity.name, this.space))
         || containsIgnoreCase(taggable.links['space'].target.entity.name, this.space);
    } catch(err) {
      return false;
    }
  }
  toString():string {
    return 'space:' + this.space;
  }
}

export class RegionFilter implements TaggableFilter {
  constructor(private region:string) {}
  accept(taggable:Taggable):boolean {
    return containsIgnoreCase(taggable.region, this.region);
  }
  toString():string {
    return 'region:' + this.region;
  }
}

export class ServiceFilter implements TaggableFilter {
  constructor(private service:string) {
    this.service = service.toLowerCase();
  }
  accept(taggable:Taggable):boolean {
    try {
      return containsIgnoreCase(taggable.links['service'].target.entity.label, this.service);
    } catch(err) {
      return false;
    }
  }
  toString():string {
    return 'service:' + this.service;
  }
}

export class StatusFilter implements TaggableFilter {
  constructor(private status:string) {
    status = status.toLowerCase();
    if (status === 'started' || status === 'up') {
      this.status = 'STARTED';
    } else {
      this.status = 'STOPPED';
    }
  }
  accept(taggable:Taggable):boolean {
    try {
      return taggable.target.entity.state === this.status;
    } catch(err) {
      return false;
    }
  }
  toString():string {
    return `status:${this.status}`;
  }
}

export class OutdatedFilter implements TaggableFilter {
  constructor(private outdated:boolean) { }
  accept(taggable:Taggable):boolean {
    try {
      return taggable.type === 'service_instance' &&
      (taggable as ServiceInstance).isOutdated() === this.outdated;
    } catch(err) {
      return false;
    }
  }
}

export class UpdatedFilter implements TaggableFilter {
  constructor(private date:string) {
    function pad(number) {
      if (number < 10) {
        return '0' + number;
      }
      return number;
    }
    const aDate = new Date(date);
    this.date = aDate.getUTCFullYear() +
      '-' + pad(aDate.getUTCMonth() + 1) +
      '-' + pad(aDate.getUTCDate()) +
      'T' + pad(aDate.getUTCHours()) +
      ':' + pad(aDate.getUTCMinutes()) +
      ':' + pad(aDate.getUTCSeconds()) +
      'Z';
  }
  accept(taggable:Taggable):boolean {
    if (taggable.target.metadata.updated_at) {
      return this.date.localeCompare(taggable.target.metadata.updated_at) <= 0;
    } else {
      return this.date.localeCompare(taggable.target.metadata.created_at) <= 0;
    }
  }
  toString():string {
    return `updated_at:${this.date}`;
  }
}
export class TaggableFilterFactory {
  static buildFilter(query:string, includeParents:boolean):TaggableFilter {
    if (query === null || query === undefined) {
      return new AcceptAllFilter();
    }

    const filterTexts = query.trim().split(' ');
    const filters = filterTexts.map(text => {
      if (text.startsWith('region:')) {
        return new RegionFilter(text.substring('region:'.length));
      } else if (text.startsWith('org:')) {
        return new OrganizationFilter(text.substring('org:'.length));
      } else if (text.startsWith('space:')) {
        return new SpaceFilter(text.substring('space:'.length));
      } else if (text.startsWith('service:')) {
        return new ServiceFilter(text.substring('service:'.length));
      } else if (text.startsWith('type:')) {
        return new TypeFilter(text.substring('type:'.length));
      } else if (text.startsWith('tag:')) {
        return new TagFilter(text.substring('tag:'.length));
      } else if (text.startsWith('url:')) {
        return new UrlFilter(text.substring('url:'.length));
      } else if (text.startsWith('status:')) {
        return new StatusFilter(text.substring('status:'.length));
      } else if (text.startsWith('diego:')) {
        return new DiegoFilter("true" === text.substring('diego:'.length));
      } else if (text.startsWith('updated_at:')) {
        return new UpdatedFilter(text.substring('updated_at:'.length));
      } else if (text.startsWith('outdated:')) {
        return new OutdatedFilter(text.substring('outdated:'.length) === 'true');
      } else {
        return new TextFilter(text);
      }
    });
    return new CompoundFilter(filters, includeParents);
  }
}
