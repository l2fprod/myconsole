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
  children: Taggable[][] = [];

  resolveLinks(service:TagService) {
    if (!this.target) {
      console.log(this._id, 'has no target');
      return;
    }
  }

  static TYPE_ORGANIZATION = new TaggableType('organization', 'Organization', 'Organizations', 'users');
  static TYPE_SPACE = new TaggableType('space', 'Space', 'Spaces', 'folder');
  static TYPE_APPLICATION = new TaggableType('app', 'Application', 'Applications', 'rocket');
  static TYPE_SERVICE_INSTANCE = new TaggableType('service_instance', 'Service', 'Services', 'cloud');
  protected static TYPE_SERVICE = new TaggableType('service', 'Service', 'Services', null);

  static TYPES: TaggableType[] = [
    Taggable.TYPE_ORGANIZATION,
    Taggable.TYPE_SPACE,
    Taggable.TYPE_APPLICATION,
    Taggable.TYPE_SERVICE_INSTANCE
    //new TaggableType('plan', 'Plan', 'Plans')
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
    switch(type) {
      case Taggable.TYPE_ORGANIZATION.name:
        return new Organization(_id, tags, target, region);
      case Taggable.TYPE_SPACE.name:
        return new Space(_id, tags, target, region);
      case Taggable.TYPE_APPLICATION.name:
        return new Application(_id, tags, target, region);
      case Taggable.TYPE_SERVICE_INSTANCE.name:
        return new ServiceInstance(_id, tags, target, region);
      case Taggable.TYPE_SERVICE.name:
        return new Service(_id, tags, target, region);
    default:
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

  getTargetUrl():string {
    return null;
  }

  compareTo(other:Taggable):number {
    try {
      return this.getName().localeCompare(other.getName(), [], { sensitivity: 'base' });
    } catch (err) {
      console.log(this._id, err);
      return -1;
    }
  }

  toString():string {
    return this._id;
  }
}

class Organization extends Taggable {
  constructor(_id: string, tags: string[], target: any, region: string) {
    super(_id, Taggable.TYPE_ORGANIZATION.name, tags, target, region);
    this.children['spaces'] = [];
  }
  resolveLinks(service:TagService) {
  }
  getTargetUrl():string {
    return `https://console.${this.region}.bluemix.net/dashboard/apps/?orgName=${encodeURIComponent(this.target.entity.name)}`;
  }
}

class Space extends Taggable {
  constructor(_id: string, tags: string[], target: any, region: string) {
    super(_id, Taggable.TYPE_SPACE.name, tags, target, region);
    this.children['apps'] = [];
    this.children['services'] = [];
  }
  resolveLinks(service:TagService) {
    this.links['org'] = service.getTaggable(this.target.entity.organization_guid);
    this.links['org'].children['spaces'].push(this);
  }

  getTargetUrl():string {
    return `https://console.${this.region}.bluemix.net/dashboard/apps/?orgName=${encodeURIComponent(this.links['org'].target.entity.name)}&spaceName=${encodeURIComponent(this.target.entity.name)}`;
  }
}

class Application extends Taggable {
  constructor(_id: string, tags: string[], target: any, region: string) {
    super(_id, Taggable.TYPE_APPLICATION.name, tags, target, region);
  }
  resolveLinks(service:TagService) {
    this.links['space'] = service.getTaggable(this.target.entity.space_guid);
    this.links['space'].children['apps'].push(this);
    this.links['org'] = service.getTaggable(this.links['space'].target.entity.organization_guid);
  }

  getTargetUrl():string {
    return `https://console.${this.region}.bluemix.net/apps/${this.target.metadata.guid}`;
  }
}

class Service extends Taggable {
  constructor(_id: string, tags: string[], target: any, region: string) {
    super(_id, Taggable.TYPE_SERVICE.name, tags, target, region);
  }
  resolveLinks(service:TagService) {
  }
  getName():string {
    return this.target.entity.label;
  }
}

class ServiceInstance extends Taggable {
  constructor(_id: string, tags: string[], target: any, region: string) {
    super(_id, Taggable.TYPE_SERVICE_INSTANCE.name, tags, target, region);
  }
  resolveLinks(service:TagService) {
    this.links['space'] = service.getTaggable(this.target.entity.space_guid);
    this.links['space'].children['services'].push(this);
    this.links['org'] = service.getTaggable(this.links['space'].target.entity.organization_guid);
    this.links['service_plan'] = service.getTaggable(this.target.entity.service_plan_guid);
    if (this.links['service_plan']) {
      this.links['service'] = service.getTaggable(this.links['service_plan'].target.entity.service_guid);
    }
  }
  getTargetUrl():string {
    return `https://console.${this.region}.bluemix.net/services/${this.target.metadata.guid}`;
  }
}
