import { Taggable } from './taggable';

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
  constructor(private filters:TaggableFilter[]) {}
  accept(taggable:Taggable):boolean {
    for (let i = 0, c = this.filters.length; i < c; i++) {
      if (!this.filters[i].accept(taggable)) {
        return false;
      }
    }
    return true;
  }
  toString():string {
    return this.filters.toString();
  }
}

export class TextFilter implements TaggableFilter {
  constructor(private text:string) {}
  accept(taggable:Taggable):boolean {
    try {
      return (taggable.target.entity.name && taggable.target.entity.name.indexOf(this.text)>=0)
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
    return taggable.tags.indexOf(this.tag)>=0;
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

export class OrganizationFilter implements TaggableFilter {
  constructor(private org:string) {
    this.org = org.toLowerCase();
  }
  accept(taggable:Taggable):boolean {
    try {
      return (taggable.type === 'organization' &&
         taggable.target.entity.name.toLowerCase().indexOf(this.org)>=0)
         || taggable.links['org'].target.entity.name.toLowerCase().indexOf(this.org)>=0;
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
         taggable.target.entity.name.toLowerCase().indexOf(this.space)>=0)
         || taggable.links['space'].target.entity.name.toLowerCase().indexOf(this.space)>=0;
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
    return taggable.region.indexOf(this.region)>=0;
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
      return taggable.links['service'].target.entity.label.toLowerCase().indexOf(this.service)>=0;
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
    return 'status:' + this.status;
  }
}

export class TaggableFilterFactory {
  static buildFilter(query:string):TaggableFilter {
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
      } else if (text.startsWith('status:')) {
        return new StatusFilter(text.substring('status:'.length));
      } else if (text.startsWith('diego:')) {
        return new DiegoFilter("true" === text.substring('diego:'.length));
      } else {
        return new TextFilter(text);
      }
    });
    return new CompoundFilter(filters);
  }
}
