import React from 'react';
import {
  MemoryRouter,
  Route,
} from 'react-router-dom';
import { View } from '@hippy/react';
import routes from '../routes';
import Header from '../shared/Header';
import Gallery from './gallery';
import AllowTs from "./allowTs";

const ALL_ROUTES = [{
  path: '/Gallery',
  name: 'Hippy React',
  component: Gallery,
}, ...routes];

export const Entry = () => (
  <View style={{ flex: 1 }}>
    <AllowTs test='1' />
    <MemoryRouter initialEntries={['/Gallery']}>
      {
        ALL_ROUTES.map((item) => {
          const Comp = item.component;
          return (
            <Route key={item.path} exact path={`${item.path}`}>
              <View style={{ flex: 1 }}>
               <Header route={item} />
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
