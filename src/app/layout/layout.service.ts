import { Routes, Route } from '@angular/router';
import { LayoutComponent } from './layout.component';

/**
 * Creates routes using the layout component. Reuses
 * instance when navigating between child views
 *
 * @param routes The routes to add.
 * @return The new route using shell as the base.
 */
export class LayoutService {
  static childRoutes(routes: Routes): Route {
    return {
      path: '',
      component: LayoutComponent,
      children: routes,
      data: { reuse: true }
    };
  }
}
