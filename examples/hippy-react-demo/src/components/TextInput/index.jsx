import React, { Component } from 'react';
import {
  ScrollView,
  TextInput,
  StyleSheet,
  View,
  Text,
} from 'hippy-react';

const styles = StyleSheet.create({
  container_style: {
    padding: 10,
  },
  input_style: {
    width: 300,
    marginVertical: 10,
    placeholderTextColor: '#aaaaaa',
    fontSize: 16,
    color: '#242424',
    height: 30,
    lineHeight: 30,
  },
  itemTitle: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 2,
    backgroundColor: '#fafafa',
    padding: 10,
    marginTop: 10,
  },
  button: {
    borderColor: '#4c9afa',
    borderWidth: 1,
  },
});

export default class TextInputExpo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textContent: '',
    };
    this.changeInputContent = this.changeInputContent.bind(this);
  }

  changeInputContent() {
    this.setState({
      textContent: `当前时间毫秒：${Date.now()}`,
    });
  }

  render() {
    const { textContent } = this.state;
    const renderTitle = title => (
      <View style={styles.itemTitle}>
        <Text>{title}</Text>
      </View>
    );
    return (
      <ScrollView style={styles.container_style}>
        {renderTitle('email')}
        <TextInput
          style={styles.input_style}
          keyboardType="email"
          placeholder="email"
          defaultValue={textContent}
        />
        <View style={styles.button} onClick={this.changeInputContent}>
          <Text>点击改变输入框内容</Text>
        </View>
        {renderTitle('numeric')}
        <TextInput
          style={styles.input_style}
          keyboardType="numeric"
          placeholder="numeric"
        />
        {renderTitle('phone-pad')}
        <TextInput
          style={styles.input_style}
          keyboardType="phone-pad"
          placeholder="phone-pad"
        />
        {renderTitle('password')}
        <TextInput
          style={styles.input_style}
          keyboardType="password"
          placeholder="password"
        />
        {renderTitle('maxLength')}
        <TextInput
          style={styles.input_style}
          placeholder="maxLength=5"
          maxLength={5}
        />
      </ScrollView>
    );
  }
}
