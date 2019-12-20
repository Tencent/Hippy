import React from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
} from 'hippy-react';

const styles = StyleSheet.create({
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
  itemContent: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: 100,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderRadius: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#ffffff',
    padding: 10,
  },
  normalText: {
    fontSize: 14,
    lineHeight: 18,
    fontColor: 'black',
  },
  button: {
    width: 100,
    height: 24,
    borderColor: 'blue',
    borderWidth: 1,
  },
  buttonText: {
    width: 100,
    lineHeight: 24,
    textAlign: 'center',
  },
});

export default class TextExpo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fontSize: 16,
    };
    this.incrementFontSize = this.incrementFontSize.bind(this);
    this.decrementFontSize = this.decrementFontSize.bind(this);
  }

  incrementFontSize() {
    const { fontSize } = this.state;
    if (fontSize === 24) {
      return;
    }
    this.setState({
      fontSize: fontSize + 1,
    });
  }

  decrementFontSize() {
    const { fontSize } = this.state;
    if (fontSize === 6) {
      return;
    }
    this.setState({
      fontSize: fontSize - 1,
    });
  }

  render() {
    const { fontSize } = this.state;
    const renderTitle = title => (
      <View style={styles.itemTitle}>
        <Text style>{title}</Text>
      </View>
    );
    return (
      <ScrollView style={{ padding: 10 }}>
        {renderTitle('color')}
        <View style={styles.itemContent}>
          <Text style={[styles.normalText, { color: '#242424' }]}>Text color is black</Text>
          <Text style={[styles.normalText, { color: 'blue' }]}>Text color is blue</Text>
          <Text style={[styles.normalText, { color: 'rgb(228,61,36)' }]}>This is red</Text>
        </View>
        {renderTitle('fontSize')}
        <View style={styles.itemContent}>
          <Text style={[styles.normalText, { fontSize }]}>
            { `Text fontSize is ${fontSize}` }
          </Text>
          <View style={styles.button} onClick={this.incrementFontSize}>
            <Text style={styles.buttonText}>放大字体</Text>
          </View>
          <View style={styles.button} onClick={this.decrementFontSize}>
            <Text style={styles.buttonText}>缩小字体</Text>
          </View>
        </View>
        {renderTitle('fontStyle')}
        <View style={styles.itemContent}>
          <Text style={[styles.normalText, { fontStyle: 'normal' }]}>Text fontStyle is normal</Text>
          <Text style={[styles.normalText, { fontStyle: 'italic' }]}>Text fontStyle is italic</Text>
        </View>
        {renderTitle('numberOfLines')}
        <View style={styles.itemContent}>
          <Text numberOfLines={1} style={styles.normalText}>
            just one line just one line just one line just
            one line just one line just one line just one line just one line
          </Text>
          <Text numberOfLines={2} style={styles.normalText}>
            just two lines just two lines just two lines just
            two lines just two lines
            just two lines just two lines just two lines just two lines just two lines just two
            lines just two lines just two lines just two lines just two lines just two lines
          </Text>
        </View>
        {renderTitle('Nest Text')}
        <View style={styles.itemContent}>
          <Text numberOfLines={3}>
            <Text numberOfLines={3} style={[styles.normalText, { color: '#4c9afa' }]}>#SpiderMan#</Text>
            <Text numberOfLines={3} style={styles.normalText}>
              Hello world, I am a spider man and I have five friends in other universe.
            </Text>
          </Text>
        </View>
      </ScrollView>
    );
  }
}
