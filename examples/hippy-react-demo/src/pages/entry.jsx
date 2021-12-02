import React from 'react';
import {
  MemoryRouter,
  Route,
} from 'react-router-dom';
import { View } from '@hippy/react';
import routes from '../routes';
import Header from '../shared/Header';
import Gallery from './gallery';

const ALLROUTES = [{
  path: '/Gallery',
  name: 'Hippy React 示例',
  component: Gallery,
  meta: {
    style: 1,
  },
}, ...routes];

export const Entry = () => (
  <View style={{ flex: 1, backgroundColor: '#fff' }}>
    <MemoryRouter initialEntries={['/Gallery']}>
      {
        ALLROUTES.map((item) => {
          const Comp = item.component;
          return (
            <Route key={item.path} exact path={`${item.path}`}>
              <View style={{ flex: 1, backgroundColor: '#fff' }}
                    onClick={() => {
                      console.log('click router');
                    }}>
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
