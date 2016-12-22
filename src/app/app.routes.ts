import { Routes } from '@angular/router';

import { DashboardRoutes } from './dashboard/dashboard.routes';
import { NavigatorRoutes } from './navigator/navigator.routes';
import { ListViewRoutes } from './listview/listview.routes';
import { BrowserRoutes } from './browser/browser.routes';
import { SettingsRoutes } from './settings/settings.routes';
import { HelpRoutes } from './help/help.routes';

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
  ...HelpRoutes,
  {
    path: '**',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
];
