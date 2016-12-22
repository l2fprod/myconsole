import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';
import { RouterModule } from '@angular/router';
import { Angulartics2Module, Angulartics2GoogleAnalytics } from 'angulartics2';

import { AppComponent } from './app.component';
import { routes } from './app.routes';

import { DashboardModule } from './dashboard/dashboard.module';
import { NavigatorModule } from './navigator/navigator.module';
import { BrowserModule as MyConsoleBrowserModule } from './browser/browser.module';
import { ListViewModule } from './listview/listview.module';
import { SettingsModule } from './settings/settings.module';
import { HelpModule } from './help/help.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    // use routes link /#/browse instead of /browse so that I don't need to configure nginx or apache .htaccess
    RouterModule.forRoot(routes, { useHash: true }),
    MaterialModule.forRoot(),
    SharedModule.forRoot(),
    NavigatorModule,
    DashboardModule,
    ListViewModule,
    MyConsoleBrowserModule,
    SettingsModule,
    HelpModule,
    Angulartics2Module.forRoot([ Angulartics2GoogleAnalytics ]),
  ],
  exports: [],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
