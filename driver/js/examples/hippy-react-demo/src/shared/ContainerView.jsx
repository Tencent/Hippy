import React, { Component } from 'react';
import {
  View,
} from '@hippy/react';

const styles = {
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#E5E5E5',
  },
};

export default class ContainerView extends Component {
  render() {
    const { children } = this.props;
    return (
      <View
        style={styles.container}
        onLayout={this.onLayout}
      >
        {children}
      </View>
    );
  }
}
