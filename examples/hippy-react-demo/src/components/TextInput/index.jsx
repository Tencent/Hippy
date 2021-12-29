import React, { Component } from 'react';
import {
  ScrollView,
  TextInput,
  StyleSheet,
  View,
  Text,
} from '@hippy/react';

const styles = StyleSheet.create({
  container_style: {
    padding: 10,
  },
  input_style: {
    width: 300,
    marginVertical: 10,
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
    width: 200,
    borderColor: '#4c9afa',
    borderWidth: 1,
    marginTop: 5,
    marginBottom: 5,
  },
});

export default class TextInputExpo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textContent: '',
    };
    this.changeInputContent = this.changeInputContent.bind(this);
    this.focus = this.focus.bind(this);
    this.blur = this.blur.bind(this);
    this.clear = this.clear.bind(this);
    this.getValue = this.getValue.bind(this);
    this.setValue = this.setValue.bind(this);
    this.hideInputMethod = this.hideInputMethod.bind(this);
    this.showInputMethod = this.showInputMethod.bind(this);
    this.onTextChange = this.onTextChange.bind(this);
    this.input = React.createRef();
  }

  changeInputContent() {
    console.log('set content');
    this.setState(() => ({
      textContent: `当前时间毫秒：${Date.now()}`,
    }));
    console.log('text content', this.state.textContent);
  }

  focus() {
    this.input.current.focus();
  }

  blur() {
    this.input.current.blur();
  }

  clear() {
    console.log('this input', this.input);
    this.input.current.clear();
  }

  getValue() {
    console.log('input value', this.input.current.getValue());
  }

  setValue() {
    this.input.current.setValue('set Value');
  }

  hideInputMethod() {
    console.log('show Input Method');
    this.input.current.hideInputMethod();
  }

  showInputMethod() {
    this.input.current.showInputMethod();
  }

  onTextChange(text) {
    console.log('onText change', text);
    this.setState({
      textContent: text,
    });
  }

  componentDidMount() {
    console.log('this ref', this.input);
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
        {renderTitle('text')}
        <TextInput
          ref={this.input}
          style={styles.input_style}
          caretColor='yellow'
          underlineColorAndroid='grey'
          placeholderTextColor='#4c9afa'
          placeholder="text"
          value={textContent}
          onChangeText={this.onTextChange}
          defaultValue={textContent}
        />
        <View style={styles.button} onClick={this.changeInputContent}>
          <Text>点击改变输入框内容</Text>
        </View>
        <View style={styles.button} onClick={this.focus}>
          <Text>Focus</Text>
        </View>
        <View style={styles.button} onClick={this.blur}>
          <Text>Blur</Text>
        </View>
        <View style={styles.button} onClick={this.clear}>
          <Text>clear</Text>
        </View>
        <View style={styles.button} onClick={this.setValue}>
          <Text>setValue</Text>
        </View>
        <View style={styles.button} onClick={this.getValue}>
          <Text>getValue</Text>
        </View>
        <View style={styles.button} onClick={this.hideInputMethod}>
          <Text>hideInputMethod</Text>
        </View>
        <View style={styles.button} onClick={this.showInputMethod}>
          <Text>showInputMethod</Text>
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
          placeholder="Password"
          multiline={false}
        />
        {renderTitle('maxLength')}
        <TextInput
          style={styles.input_style}
          placeholder="maxLength=5"
          maxLength={5}
        />
        {renderTitle('multiline')}
        <TextInput
          style={styles.input_style}
          placeholder="maxLength=5"
          maxLength={5}
          multiline={true}
        />
      </ScrollView>
    );
  }
}
