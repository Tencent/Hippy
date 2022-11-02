import HomeEntry from './pages/entry';
import React, { Component } from 'react';
import {
  View,
} from '@hippy/react';


export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = ({
      pageIndex: 0,
    });
  }
  render() {
    return (
      <View>
        <HomeEntry />
      </View>
    );
  }
}
