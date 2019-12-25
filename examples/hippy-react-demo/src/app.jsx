import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
} from 'hippy-react';
import Gallery from './pages/gallery';
import Camera from './pages/camera';
import Debug from './pages/debug';
import SafeAreaView from './shared/SafeAreaView';

const styles = StyleSheet.create({
  buttonContainer: {
    height: 48,
    backgroundColor: 'white',
    flexDirection: 'row',
  },
  button: {
    height: 48,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  buttonText: {
    color: '#242424',
    fontSize: 16,
  },
  blankPage: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = ({
      pageIndex: 0,
    });
  }

  render() {
    const { pageIndex } = this.state;
    const { isSimulator, __instanceId__: instanceId } = this.props;
    const renderPage = () => {
      switch (pageIndex) {
        case (0):
          return <Gallery />;
        case (1):
          // iOS模拟器第二个tab是调试功能
          // Android暂时也不支持扫码
          if (isSimulator) return <Debug instanceId={instanceId} />;
          return <Camera instanceId={instanceId} />;
        case (2):
          return <Debug instanceId={instanceId} />;
        default:
          return <View style={styles.blankPage} />;
      }
    };

    const renderButton = () => {
      let buttonArray = ['API', '本地调试'];
      // iOS 真机仅支持查看范例
      if (Platform.OS === 'ios' && !isSimulator) {
        buttonArray = ['API'];
      }
      return (
        buttonArray.map((v, i) => (
          <View
            style={styles.button}
            onClick={() => this.setState({ pageIndex: i })}
          >
            <Text
              style={[styles.buttonText, i === pageIndex ? { color: '#4c9afa' } : null]}
              numberOfLines={1}
            >
              {v}
            </Text>
          </View>
        ))
      );
    };

    return (
      <SafeAreaView statusBarColor="#4c9afa">
        {renderPage()}
        <View style={styles.buttonContainer}>
          {renderButton()}
        </View>
      </SafeAreaView>
    );
  }
}
