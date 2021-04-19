import React from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  Image, Platform,
} from '@hippy/react';

const imgURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAtCAMAAABmgJ64AAAAOVBMVEX/Rx8AAAD/QiL/Tif/QyH/RR//QiH/QiP/RCD/QSL/Qxz/QyH/QiL/QiD/QyL/QiL/QiH/QyH/QiLwirLUAAAAEnRSTlMZAF4OTC7DrWzjI4iietrRk0EEv/0YAAAB0UlEQVRYw72Y0Y6sIAxAKwUFlFH7/x97izNXF2lN1pU5D800jD2hJAJCdwYZuAUyVbmToKh903IhQHgErAVH+ccV0KI+G2oBPMxJgPA4WAigAT8F0IRDgNAE3ARyfeMFDGSc3YHVFkTBAHKDAgkEyHjacae/GTjxFqAo8NbakXrL9DRy9B+BCQwRcXR9OBKmEuAmAFFgcy0agBnIc1xZsMPOI5loAoUsQFmQjDEL9YbpaeGYBMGRKKAuqFEFL/JXApCw/zFEZk9qgbLGBx0gXLISxT25IUBREEgh1II1fph/IViGnZnCcDDVAgfgVg6gCy6ZaClySbDQpAl04vCGaB4+xGcFRK8CLvW0IBb5bQGqAlNwU4C6oEIVTLTcmoEr0AWcpKsZ/H0NAtkLQffnFjkOqiC/TTWBL9AFCwXQBHgI7rXImMgjCZwFa50s6DRBXyALmIECuMASiWNPFgRTgSJwM+XW8PDCmbwndzdaNL8FMYXPNjASDVChnIvWlBI/MKadPV952HszbmXtRERhhQ0vGFA52SVSSVt7MjHvxfRK8cdTpqovn02dUcltMrwiKf+wQ1FxXKCk9en6e/eDNnP44h2thQEb35O/etNv/q3iHza+KuhqqhZAAAAAAElFTkSuQmCC';

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
  customFont: {
    color: '#0052d9',
    fontSize: 32,
    fontFamily: 'TTTGB',
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
    // if Android text nested is used，height and lineHeight attributes should be set in Text wrapper
    this.androidNestedTextWrapperStyle = { height: 100, lineHeight: 100 };
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
        {renderTitle('Custom font')}
        <View style={styles.itemContent}>
          <Text numberOfLines={1} style={styles.customFont}>Hippy 跨端框架</Text>
        </View>
        {renderTitle('Text Nested')}
        <View style={styles.itemContent}>
          <Text style={Platform.OS === 'android' ? this.androidNestedTextWrapperStyle : {}}>
            <Text numberOfLines={1} style={styles.normalText}>后面有张图片</Text>
            <Image style={{ width: 70, height: 35 }} source={{ uri: imgURL }} />
            <Text numberOfLines={1} style={styles.customFont}>前面有张图片</Text>
          </Text>
        </View>
      </ScrollView>
    );
  }
}
