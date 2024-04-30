import React from 'react';
import {
  AsyncStorage,
  ScrollView,
} from '@hippy/react';

export class StorageSpec extends React.Component {
  constructor(props) {
    super(props);
    this.useKey = 'usekey';
  }
  componentDidMount() {
    globalThis.currentRef = {
      getValue: () => AsyncStorage.getItem(this.useKey),
      setValue: value => AsyncStorage.setItem(this.useKey, value),
    };
    AsyncStorage.setItem(this.useKey, 'defaultValue');
  }

  render() {
    return (
      <ScrollView>
      </ScrollView>
    );
  }
}
