import { TagService } from './tag-service.service';
import { TaggableFilter, TaggableFilterFactory } from './taggablefilter';

export class TaggableType {
  constructor(public name: string, public display: string, public plural: string, public icon:string) { }
}

export class Taggable {

  _id: string;
  _rev: string;
  type: string;
  tags: string[];
  target: any; // the app, org, space object with useful data to display
  region: string;
  links: Taggable[] = [];

  resolveLinks(service:TagService) {
    if (!this.target) {
      console.log(this._id, 'has no target');
      return;
    }

    if ('service_instance' === this.type) {
      this.links['space'] = service.getTaggable(this.target.entity.space_guid);
      this.links['service_plan'] = service.getTaggable(this.target.entity.service_plan_guid);
      // plan guid can be null for service instances using an old plan
      if (this.links['service_plan']) {
        this.links['service'] = service.getTaggable(this.links['service_plan'].target.entity.service_guid);
      }
      this.links['org'] = service.getTaggable(this.links['space'].target.entity.organization_guid);
    } else if ('app' === this.type) {
      this.links['space'] = service.getTaggable(this.target.entity.space_guid);
      this.links['org'] = service.getTaggable(this.links['space'].target.entity.organization_guid);
    } else if ('space' === this.type) {
      this.links['org'] = service.getTaggable(this.target.entity.organization_guid);
    }
  }

  static TYPE_ORGANIZATION = new TaggableType('organization', 'Organization', 'Organizations', 'users');
  static TYPE_SPACE = new TaggableType('space', 'Space', 'Spaces', 'folder');
  static TYPE_APPLICATION = new TaggableType('app', 'Application', 'Applications', 'rocket');
  static TYPE_SERVICE_INSTANCE = new TaggableType('service_instance', 'Service', 'Services', 'cloud');

  static TYPES: TaggableType[] = [
    Taggable.TYPE_ORGANIZATION,
    Taggable.TYPE_SPACE,
    Taggable.TYPE_APPLICATION,
    Taggable.TYPE_SERVICE_INSTANCE
    //new TaggableType('plan', 'Plan', 'Plans')
    //new TaggableType('service', 'Service', 'Services')
  ];

  static fromDoc(doc:any):Taggable {
    let taggable = Taggable.newTaggable(
      doc._id,
      doc.type,
      doc.tags,
      doc.target,
      doc.region);
    taggable._rev = doc._rev;
    return taggable;
  }

  static newTaggable(_id: string, type: string, tags: string[], target: any, region: string) {
    if (type === 'space') {
      return new Space(_id, type, tags, target, region);
    } else if (type === 'service') {
      return new Service(_id, type, tags, target, region);
    } else {
      return new Taggable(_id, type, tags, target, region);
    }
  }

  protected constructor(_id: string, type: string, tags: string[], target: any, region: string) {
    this._id = _id;
    this.type = type;
    this.tags = tags;
    this.target = target;
    this.region = region;
  }

  getName():string {
    return this.target.entity.name;
  }

  compareTo(other:Taggable):number {
    return this.getName().localeCompare(other.getName());
  }

  toString():string {
    return this._id;
  }
}

class Service extends Taggable {
  constructor(_id: string, type: string, tags: string[], target: any, region: string) {
    super(_id, type, tags, target, region);
  }
  getName():string {
    return this.target.entity.label;
  }
}

class Space extends Taggable {
  constructor(_id: string, type: string, tags: string[], target: any, region: string) {
    super(_id, type, tags, target, region);
  }
}
