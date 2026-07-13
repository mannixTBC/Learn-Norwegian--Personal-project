import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './routeConfig';

/**
 * Randează toate rutele aplicației pe baza configurației din routeConfig.js.
 * Folosește React Router v5 (Switch + Route).
 */
function AppRoutes() {
  return (
    <Switch>
      {routes.map(({ path, exact, component: Component }) => (
        <Route
          key={path}
          path={path}
          exact={exact}
          component={Component}
        />
      ))}
    </Switch>
  );
}

export default AppRoutes;
