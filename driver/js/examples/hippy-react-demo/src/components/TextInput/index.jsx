import React, { Component } from 'react';
import {
  ScrollView,
  TextInput,
  StyleSheet,
  View,
  Text,
  Platform,
} from '@hippy/react';

const DEFAULT_VALUE = 'The 58-letter name Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch is the name of a town on Anglesey, an island of Wales.';

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
    // you can use lineHeight/lineSpacing/lineHeightMultiple
    // to control the space between lines in multi-line input.(iOS only for now)
    // for example:
    lineHeight: 30,
    // lineSpacing: 50,
    // lineHeightMultiple: 1.5,
  },
  input_style_block: {
    height: 100,
    lineHeight: 20,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'gray',
    underlineColorAndroid: 'transparent',
  },
  itemTitle: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: 40,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e0e0e0',
    borderRadius: 2,
    backgroundColor: '#fafafa',
    padding: 10,
    marginTop: 10,
  },
  itemContent: {
    marginTop: 10,
  },
  buttonBar: {
    flexDirection: 'row',
    marginTop: 10,
    flexGrow: 1,
  },
  button: {
    width: 200,
    height: 24,
    borderColor: '#4c9afa',
    borderWidth: 1,
    borderStyle: 'solid',
    marginTop: 5,
    marginBottom: 5,
    flexGrow: 1,
    flexShrink: 1,
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
  }

  changeInputContent() {
    this.setState({
      textContent: `当前时间毫秒：${Date.now()}`,
    });
  }

  focus() {
    this.input.focus();
  }

  blur() {
    this.input.blur();
  }

  async onFocus() {
    const value = await this.input.isFocused();
    this.setState({
      event: 'onFocus',
      isFocused: value,
    });
  }

  async onBlur() {
    const value = await this.input.isFocused();
    this.setState({
      event: 'onBlur',
      isFocused: value,
    });
  }

  changeBreakStrategy(breakStrategy) {
    this.setState({ breakStrategy });
  }

  render() {
    const { textContent, event, isFocused, breakStrategy } = this.state;
    const renderTitle = title => (
      <View style={styles.itemTitle}>
        <Text>{title}</Text>
      </View>
    );
    return (
      <ScrollView style={styles.container_style}>
        {renderTitle('text')}
        <TextInput
          ref={(ref) => {
            this.input = ref;
          }}
          style={styles.input_style}
          caretColor='yellow'
          underlineColorAndroid='grey'
          placeholderTextColor='#4c9afa'
          placeholder="text"
          defaultValue={textContent}
          onBlur={() => this.onBlur()}
          onFocus={() => this.onFocus()}
        />
        <Text style={styles.itemContent}>{`事件: ${event} | isFocused: ${isFocused}`}</Text>
        <View style={styles.button} onClick={this.changeInputContent}>
          <Text>点击改变输入框内容</Text>
        </View>
        <View style={styles.button} onClick={this.focus}>
          <Text>Focus</Text>
        </View>
        <View style={styles.button} onClick={this.blur}>
          <Text>Blur</Text>
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
          caretColor={'yellow'}
          style={styles.input_style}
          placeholder="maxLength=5"
          maxLength={5}
        />
        {Platform.OS === 'android' && renderTitle('breakStrategy')}
        {Platform.OS === 'android' && (
          <>
            <TextInput
              style={styles.input_style_block}
              breakStrategy={breakStrategy}
              defaultValue={DEFAULT_VALUE} />
            <Text style={{}}>{`breakStrategy: ${breakStrategy}`}</Text>
            <View style={styles.buttonBar}>
              <View style={styles.button} onClick={() => this.changeBreakStrategy('simple')}>
                <Text style={styles.buttonText}>simple</Text>
              </View>
              <View style={styles.button} onClick={() => this.changeBreakStrategy('high_quality')}>
                <Text style={styles.buttonText}>high_quality</Text>
              </View>
              <View style={styles.button} onClick={() => this.changeBreakStrategy('balanced')}>
                <Text style={styles.buttonText}>balanced</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    );
  }
}
