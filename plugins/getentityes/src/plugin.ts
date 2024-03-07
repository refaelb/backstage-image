import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const getentityesPlugin = createPlugin({
  id: 'getentityes',
  routes: {
    root: rootRouteRef,
  },
});

export const GetentityesPage = getentityesPlugin.provide(
  createRoutableExtension({
    name: 'GetentityesPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
