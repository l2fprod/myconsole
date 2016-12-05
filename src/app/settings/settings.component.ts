import { Component, ChangeDetectorRef } from '@angular/core';
import { TagService, TaggableViewerComponent } from '../shared/index';
import { JwtHelper } from 'angular2-jwt';

@Component({
  selector: 'settings',
  templateUrl: 'settings.component.html',
  styleUrls: ['settings.component.css']
})
export class SettingsComponent extends TaggableViewerComponent {

  jwtHelper: JwtHelper = new JwtHelper();
  decodedToken:any;

  constructor(public tagService: TagService, public changeDetectorRef: ChangeDetectorRef) {
    super(tagService, changeDetectorRef);

    try {
      this.decode(tagService.token);
    } catch(err) {}
  }

  getToken() {
    return this.tagService.token;
  }

  setToken(token:string) {
    try {
      this.decode(token);
      this.tagService.setToken(token);
    } catch (err) {
      console.log(err);
    };
  }

  private decode(token:string) {
    this.decodedToken = this.jwtHelper.decodeToken(token);
    this.decodedToken.iat = new Date(this.decodedToken.iat * 1000);
    this.decodedToken.exp = new Date(this.decodedToken.exp * 1000);
  }
}
