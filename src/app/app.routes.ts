import { Routes } from '@angular/router';

import { DashboardRoutes } from './dashboard/dashboard.routes';
import { NavigatorRoutes } from './navigator/navigator.routes';
import { ListViewRoutes } from './listview/listview.routes';
import { BrowserRoutes } from './browser/browser.routes';
import { SettingsRoutes } from './settings/settings.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  ...DashboardRoutes,
  ...NavigatorRoutes,
  ...ListViewRoutes,
  ...BrowserRoutes,
  ...SettingsRoutes,
  {
    path: '**',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
];
