import React from 'react';
import {
  MemoryRouter,
  Route,
} from 'react-router-dom';
import { View } from '@hippy/react';
import routes from '../routes';
import Header from '../shared/Header';
import Gallery from './gallery';

const ALL_ROUTES = [{
  path: '/Gallery',
  name: 'Hippy React',
  component: Gallery,
  meta: {
    style: 1,
  },
}, ...routes];

export const Entry = () => (
  <View style={{ flex: 1, backgroundColor: '#fff' }}>
    <MemoryRouter initialEntries={['/Gallery']}>
      {
        ALL_ROUTES.map((item) => {
          const Comp = item.component;
          return (
            <Route key={item.path} exact path={`${item.path}`}>
              <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <Header route={item} />
                <Comp meta={item.meta || {}} />
              </View>
            </Route>
          );
        })
      }
    </MemoryRouter>
  </View>
);

export default Entry;
