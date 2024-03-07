import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { getentityesPlugin, GetentityesPage } from '../src/plugin';

createDevApp()
  .registerPlugin(getentityesPlugin)
  .addPage({
    element: <GetentityesPage />,
    title: 'Root Page',
    path: '/getentityes'
  })
  .render();
