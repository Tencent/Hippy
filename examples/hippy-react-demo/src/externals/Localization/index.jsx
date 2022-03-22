import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from '@hippy/react';

const styleObj = StyleSheet.create({
  LocalizationDemo: {
    marginTop: 20,
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    position: 'relative',
    flexDirection: 'column',
  },
});

export default class Localization extends React.Component {
  render() {
    const { country, language, direction } = Platform.Localization || {};
    return (
      <View style={styleObj.LocalizationDemo}>
        <View style={{
          height: 40,
          textAlign: 'center',
          backgroundColor: '#4c9afa',
          borderRadius: 5,
        }} onTouchDown={this.onAsyncComponentLoad}
        >
          <Text style={{
            color: 'white',
            marginHorizontal: 30,
            height: 40,
            lineHeight: 40,
            textAlign: 'center',
          }} >
            {`国际化相关信息：国家 ${country} | 语言 ${language} | 方向 ${direction === 1 ? 'RTL' : 'LTR'}`}
          </Text>
        </View>
      </View>
    );
  }
}
