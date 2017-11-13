import { TagService, Region } from './tag-service.service';
//import { TaggableFilter, TaggableFilterFactory } from './taggablefilter';

export class TaggableType {
  constructor(public name: string, public display: string, public plural: string, public icon:string) { }
}

export class Taggable {

  _id: string;
  _rev: string;
  type: string;
  tags: any[]; // tags can be string[] or the new TagModel from ng2-tag-input
  target: any; // the app, org, space object with useful data to display
  region: string;
  links: Taggable[] = [];
  children: Taggable[][] = [];

  mergeDuplicates(service:TagService):Taggable[] {
    return [];
  }

  markForDeletion() {
    (this as any)._deleted = true; // cast as any to avoid typescript error
  }

  resolveLinks(findByGuid:any) {
    if (!this.target) {
      console.log(this._id, 'has no target');
      return;
    }
  }

  mergeWith(same:Taggable) {
    this.tags = same.tags;
  }

  getRegion():Region {
    return TagService.REGIONS.find(region => region.name === this.region);
  }

  static TYPE_ORGANIZATION = new TaggableType('organization', 'Organization', 'Organizations', 'users');
  static TYPE_SPACE = new TaggableType('space', 'Space', 'Spaces', 'folder');
  static TYPE_APPLICATION = new TaggableType('app', 'Application', 'Applications', 'rocket');
  static TYPE_SERVICE_INSTANCE = new TaggableType('service_instance', 'Service', 'Services', 'cloud');
  static TYPE_SERVICE_PLAN = new TaggableType('service_plan', 'Service Plan', 'Service Plans', 'cloud');
  static TYPE_SERVICE = new TaggableType('service', 'Service', 'Services', null);
  static TYPE_ROUTE = new TaggableType('route', 'Route', 'Routes', null);
  static TYPE_ROUTE_MAPPING = new TaggableType('route_mapping', 'Route Mapping', 'Route Mapping', null);
  static TYPE_DOMAIN = new TaggableType('domain', 'Domain', 'Domains', null);

  static ALL_TYPES: TaggableType[] = [
    Taggable.TYPE_ORGANIZATION,
    Taggable.TYPE_SPACE,
    Taggable.TYPE_APPLICATION,
    Taggable.TYPE_SERVICE_INSTANCE,
    Taggable.TYPE_SERVICE_PLAN,
    Taggable.TYPE_SERVICE,
    Taggable.TYPE_ROUTE,
    Taggable.TYPE_ROUTE_MAPPING,
    Taggable.TYPE_DOMAIN,
  ]

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
      case Taggable.TYPE_ROUTE_MAPPING.name:
        return new RouteMapping(_id, tags, target, region);
      case Taggable.TYPE_ROUTE.name:
        return new Route(_id, tags, target, region);
      case Taggable.TYPE_DOMAIN.name:
        return new Domain(_id, tags, target, region);
    default:
      return new Taggable(_id, type, tags, target, region);
    }
  }

  static getType(name:string):TaggableType {
    const type = Taggable.TYPES.find(type => type.name === name);
    if (!type) {
      console.log(name, 'not found');
    }
    return type;
  }

  protected constructor(_id: string, type: string, tags: string[], target: any, region: string) {
    this._id = _id;
    this.type = type;
    this.tags = tags;
    this.target = target;
    this.region = region;
  }

  getType():TaggableType {
    return Taggable.getType(this.type);
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
      return this._id.localeCompare(other._id);
    }
  }

  toString():string {
    return this._id;
  }
}

export class Organization extends Taggable {
  constructor(_id: string, tags: string[], target: any, region: string) {
    super(_id, Taggable.TYPE_ORGANIZATION.name, tags, target, region);
    this.children['spaces'] = [];
  }
  getTargetUrl():string {
    return `https://console.bluemix.net/dashboard/apps/?orgName=${encodeURIComponent(this.target.entity.name)}&env_id=${encodeURIComponent(this.getRegion().envId)}`;
  }
}

export class Space extends Taggable {
  constructor(_id: string, tags: string[], target: any, region: string) {
    super(_id, Taggable.TYPE_SPACE.name, tags, target, region);
    this.children['apps'] = [];
    this.children['services'] = [];
  }
  resolveLinks(findByGuid:any) {
    this.links['org'] = findByGuid(this.target.entity.organization_guid);
    this.links['org'].children['spaces'].push(this);
  }
  /*
   * @returns elements to update or marked for deletion
   */
  mergeDuplicates(service:TagService):Taggable[] {
    // look at all apps in the space, if two have the same name, keep the most recent
    const mergeActions:Taggable[] = [];

    // sort apps by name and most recent first
    const apps:Taggable[] = this.children['apps'];
    apps.sort((app1, app2) => {
      let result = app1.compareTo(app2);
      if (result == 0) {
        return app2.target.metadata.updated_at.localeCompare(app1.target.metadata.updated_at);
      } else {
        return result;
      }
    });

    // remove duplicate from the apps array
    for (let index = apps.length - 1; index > 0; index--) {
      if (apps[index].getName() === apps[index - 1].getName()) {
        console.log('Detected a duplicate app, removing it', apps[index].getName());

        // merge the tags and mark the app to be persisted
        apps[index - 1].mergeWith(apps[index]);
        mergeActions.push(apps[index - 1]);

        // mark the current app for deletion as a duplicate
        apps[index].markForDeletion();
        mergeActions.push(apps[index]);

        // remove from the list
        apps.splice(index, 1);
      }
    }

    // tell the caller to delete these duplicates
    return mergeActions;
  }

  getTargetUrl():string {
    return `https://console.bluemix.net/dashboard/apps/?orgName=${encodeURIComponent(this.links['org'].target.entity.name)}&spaceName=${encodeURIComponent(this.target.entity.name)}&env_id=${encodeURIComponent(this.getRegion().envId)}`;
  }
}

export class Application extends Taggable {
  constructor(_id: string, tags: string[], target: any, region: string) {
    super(_id, Taggable.TYPE_APPLICATION.name, tags, target, region);
    this.children['routes'] = [];
  }
  resolveLinks(findByGuid:any) {
    this.links['space'] = findByGuid(this.target.entity.space_guid);
    this.links['space'].children['apps'].push(this);
    this.links['org'] = findByGuid(this.links['space'].target.entity.organization_guid);
  }
  getTargetUrl():string {
    return `https://console.bluemix.net/apps/${this.target.metadata.guid}?env_id=${encodeURIComponent(this.getRegion().envId)}`;
  }
  getAppUrls():string[] {
    return this.children['routes'].map((route) =>
      `https://${route.target.entity.host}.${route.links['domain'].target.entity.name}${route.target.entity.path}`);
  }
}

export class RouteMapping extends Taggable {
  constructor(_id: string, tags: string[], target: any, region: string) {
    super(_id, Taggable.TYPE_ROUTE_MAPPING.name, tags, target, region);
  }
  resolveLinks(findByGuid:any) {
    const app = findByGuid(this.target.entity.app_guid);
    const route = findByGuid(this.target.entity.route_guid);
    if (app && route) {
      app.children['routes'].push(route);
    }
  }
}

export class Route extends Taggable {
  constructor(_id: string, tags: string[], target: any, region: string) {
    super(_id, Taggable.TYPE_ROUTE.name, tags, target, region);
  }
  resolveLinks(findByGuid:any) {
    this.links['domain'] = findByGuid(this.target.entity.domain_guid);
  }
}

export class Domain extends Taggable {
  constructor(_id: string, tags: string[], target: any, region: string) {
    super(_id, Taggable.TYPE_DOMAIN.name, tags, target, region);
  }
}

export class Service extends Taggable {
  constructor(_id: string, tags: string[], target: any, region: string) {
    super(_id, Taggable.TYPE_SERVICE.name, tags, target, region);
  }
  getName():string {
    return this.target.entity.label;
  }
}

export class ServiceInstance extends Taggable {
  constructor(_id: string, tags: string[], target: any, region: string) {
    super(_id, Taggable.TYPE_SERVICE_INSTANCE.name, tags, target, region);
  }
  resolveLinks(findByGuid:any) {
    this.links['space'] = findByGuid(this.target.entity.space_guid);
    this.links['space'].children['services'].push(this);
    this.links['org'] = findByGuid(this.links['space'].target.entity.organization_guid);
    this.links['service_plan'] = findByGuid(this.target.entity.service_plan_guid);
    if (this.links['service_plan']) {
      this.links['service'] = findByGuid(this.links['service_plan'].target.entity.service_guid);
    }
  }
  getTargetUrl():string {
    return `https://console.bluemix.net/services/${this.target.metadata.guid}?orgName=${encodeURIComponent(this.links['org'].target.entity.name)}&spaceName=${encodeURIComponent(this.target.entity.name)}&env_id=${encodeURIComponent(this.getRegion().envId)}`;
  }
  // return true if the service this instance is linked to has been updated after this service was created.
  isOutdated():boolean {
    try {
      return this.target.metadata.created_at
        .localeCompare(this.links['service'].target.metadata.updated_at) <= 0;
    } catch (err) {
      return false;
    }
  }
}
