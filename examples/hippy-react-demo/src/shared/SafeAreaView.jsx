import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Platform,
  Dimensions,
} from 'hippy-react';
import Utils from '../utils';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default class SafeAreaView extends Component {
  constructor(props) {
    super(props);
    const { width } = Dimensions.get('window');
    const { height } = Dimensions.get('window');
    this.state = {
      isVertical: width < height,
    };
  }

  renderIPhoneStatusBar(statusBarColor) {
    const { isVertical } = this.state;
    if (Platform.OS === 'ios' && isVertical) {
      return (
        <View
          style={[
            { backgroundColor: statusBarColor || '#fff' },
            { height: Dimensions.get('screen').statusBarHeight },
          ]}
        />
      );
    }
    return null;
  }

  render() {
    const { children, statusBarColor } = this.props;
    const { isVertical } = this.state;
    let verticalStyle = null;
    if (!isVertical) {
      verticalStyle = {
        paddingHorizontal: Utils.isiPhoneX() ? 32 : 0,
      };
    }
    return (
      <View
        style={[styles.container, verticalStyle]}
        onLayout={(e) => {
          const { width, height } = e.layout;
          this.setState({ isVertical: width < height });
        }}
      >
        {this.renderIPhoneStatusBar(statusBarColor)}
        <View style={{ flex: 1 }}>
          {children}
        </View>
      </View>
    );
  }
}
