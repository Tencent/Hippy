import routes from '../routes';
import Gallery from './gallery';
import React from 'react';
import {
  MemoryRouter,
  Route,
} from 'react-router-dom';
import { View } from '@hippy/react';

const ALL_ROUTES = [{
  path: '/blank',
  name: 'Hippy React',
  component: Gallery,
  meta: {
    style: 1,
  },
}, ...routes];

export const Entry = () => (
  <View style={{ flex: 1, backgroundColor: '#fff' }}>
    <MemoryRouter initialEntries={['/blank']}>
      {
        ALL_ROUTES.map((item) => {
          const Comp = item.component;
          return (
            <Route key={item.path} exact path={`${item.path}`}>
              <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <Comp />
              </View>
            </Route>
          );
        })
      }
    </MemoryRouter>
  </View>
);

export default Entry;
