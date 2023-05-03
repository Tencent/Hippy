import React, { Component } from 'react';
import {
  ConsoleModule,
} from '@hippy/react';
import HomeEntry from './pages/entry';
import ContainerView from './shared/ContainerView';

export default class App extends Component {
  componentDidMount() {
    ConsoleModule.log('~~~~~~~~~~~~~~~~~ This is a log from ConsoleModule ~~~~~~~~~~~~~~~~~');
  }

  render() {
    return (
      <ContainerView>
        <HomeEntry />
      </ContainerView>
    );
  }
}
