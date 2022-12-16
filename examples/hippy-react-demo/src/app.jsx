import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ConsoleModule,
} from '@hippy/react';
import HomeEntry from './pages/entry';
import RemoteDebug from './pages/remote-debug';
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
    borderStyle: 'solid',
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

  componentDidMount() {
    ConsoleModule.log('~~~~~~~~~~~~~~~~~ This is a log from ConsoleModule ~~~~~~~~~~~~~~~~~');
  }

  render() {
    const { pageIndex } = this.state;
    const { __instanceId__: instanceId } = this.props;

    const renderPage = () => {
      switch (pageIndex) {
        case 0:
          return <HomeEntry />;
        case 1:
          return <RemoteDebug instanceId={instanceId} />;
        default:
          return <View style={styles.blankPage} />;
      }
    };

    const renderButton = () => {
      const buttonArray = ['API', '调试'];
      return (
        buttonArray.map((text, i) => (
          <View
            key={`button_${i}`}
            style={styles.button}
            onClick={() => this.setState({ pageIndex: i })}
          >
            <Text
              style={[styles.buttonText, i === pageIndex ? { color: '#4c9afa' } : null]}
              numberOfLines={1}
            >
              {text}
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
