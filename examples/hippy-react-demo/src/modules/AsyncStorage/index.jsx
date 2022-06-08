import React from 'react';
import {
  View,
  Text,
  TextInput,
  AsyncStorage,
  ScrollView,
  StyleSheet,
} from '@hippy/react';

const styles = StyleSheet.create({
  containerStyle: {
    margin: 20,
    alignItems: 'center',
    flexDirection: 'column',
  },
  itemGroupStyle: {
    flexDirection: 'row',
    marginTop: 10,
    borderColor: '#4c9afa',
    borderWidth: 1,
    width: 100,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewGroupStyle: {
    flexDirection: 'row',
    marginTop: 10,
  },
  infoStyle: {
    width: 60,
    height: 40,
    fontSize: 16,
    color: '#4c9afa',
    textAlign: 'center',
  },
  inputStyle: {
    width: 200,
    height: 40,
    placeholderTextColor: '#aaaaaa',
    underlineColorAndroid: '#4c9afa',
    fontSize: 16,
    color: '#242424',
    textAlign: 'left',
  },
  buttonStyle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#4c9afa',
    backgroundColor: '#4c9afa11',
    marginLeft: 10,
    marginRight: 10,
  },
});

export default class AsyncStorageExpo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      result: '',
    };
    this.onTextChangeKey = this.onTextChangeKey.bind(this);
    this.onTextChangeValue = this.onTextChangeValue.bind(this);
    this.onClickSet = this.onClickSet.bind(this);
    this.onTextChangeKey = this.onTextChangeKey.bind(this);
    this.onClickGet = this.onClickGet.bind(this);
  }

  onClickSet() {
    const { key, value } = this.state;
    if (!key) {
      return;
    }
    AsyncStorage.setItem(key, value);
  }

  onClickGet() {
    const { key } = this.state;
    if (!key) {
      return;
    }
    AsyncStorage.getItem(key).then((res) => {
      this.setState({
        result: res,
      });
    });
  }

  onTextChangeKey(e) {
    this.setState({
      key: e,
    });
  }

  onTextChangeValue(e) {
    this.setState({
      value: e,
    });
  }

  render() {
    const { result } = this.state;
    return (
      <ScrollView style={styles.containerStyle}>
        <View style={styles.viewGroupStyle}>
          <Text style={styles.infoStyle}>Key:</Text>
          <TextInput style={styles.inputStyle} onChangeText={this.onTextChangeKey} />
        </View>
        <View style={styles.viewGroupStyle}>
          <Text style={styles.infoStyle}>Value:</Text>
          <TextInput style={styles.inputStyle} onChangeText={this.onTextChangeValue} />
        </View>
        <View style={styles.itemGroupStyle} onClick={this.onClickSet}>
          <Text style={styles.buttonStyle}>Set</Text>
        </View>

        <View style={[styles.viewGroupStyle, { marginTop: 60 }]}>
          <Text style={styles.infoStyle}>Key:</Text>
          <TextInput style={styles.inputStyle} onChangeText={this.onTextChangeKey} />
        </View>
        <View style={[styles.viewGroupStyle, { display: 'none' }]}>
          <Text style={styles.infoStyle}>Value:</Text>
          <Text style={[styles.infoStyle, { width: 200 }]}>{result}</Text>
        </View>
        <View style={styles.itemGroupStyle} onClick={this.onClickGet}>
          <Text style={styles.buttonStyle}>Get</Text>
        </View>
      </ScrollView>
    );
  }
}
