import React from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  Image,
  Platform,
} from '@hippy/react';

const imgURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAtCAMAAABmgJ64AAAAOVBMVEX/Rx8AAAD/QiL/Tif/QyH/RR//QiH/QiP/RCD/QSL/Qxz/QyH/QiL/QiD/QyL/QiL/QiH/QyH/QiLwirLUAAAAEnRSTlMZAF4OTC7DrWzjI4iietrRk0EEv/0YAAAB0UlEQVRYw72Y0Y6sIAxAKwUFlFH7/x97izNXF2lN1pU5D800jD2hJAJCdwYZuAUyVbmToKh903IhQHgErAVH+ccV0KI+G2oBPMxJgPA4WAigAT8F0IRDgNAE3ARyfeMFDGSc3YHVFkTBAHKDAgkEyHjacae/GTjxFqAo8NbakXrL9DRy9B+BCQwRcXR9OBKmEuAmAFFgcy0agBnIc1xZsMPOI5loAoUsQFmQjDEL9YbpaeGYBMGRKKAuqFEFL/JXApCw/zFEZk9qgbLGBx0gXLISxT25IUBREEgh1II1fph/IViGnZnCcDDVAgfgVg6gCy6ZaClySbDQpAl04vCGaB4+xGcFRK8CLvW0IBb5bQGqAlNwU4C6oEIVTLTcmoEr0AWcpKsZ/H0NAtkLQffnFjkOqiC/TTWBL9AFCwXQBHgI7rXImMgjCZwFa50s6DRBXyALmIECuMASiWNPFgRTgSJwM+XW8PDCmbwndzdaNL8FMYXPNjASDVChnIvWlBI/MKadPV952HszbmXtRERhhQ0vGFA52SVSSVt7MjHvxfRK8cdTpqovn02dUcltMrwiKf+wQ1FxXKCk9en6e/eDNnP44h2thQEb35O/etNv/q3iHza+KuhqqhZAAAAAAElFTkSuQmCC';
const imgURL2 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAANlBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC3dmhyAAAAEXRSTlMA9QlZEMPc2Mmmj2VkLEJ4Rsx+pEgAAAChSURBVCjPjVLtEsMgCDOAdbbaNu//sttVPes+zvGD8wgQCLp/TORbUGMAQtQ3UBeSAMlF7/GV9Cmb5eTJ9R7H1t4bOqLE3rN2UCvvwpLfarhILfDjJL6WRKaXfzxc84nxAgLzCGSGiwKwsZUB8hPorZwUV1s1cnGKw+yAOrnI+7hatNIybl9Q3OkBfzopCw6SmDVJJiJ+yD451OS0/TNM7QnuAAbvCG0TSAAAAABJRU5ErkJggg==';
const imgURL3 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAANlBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC3dmhyAAAAEnRSTlMA/QpX7WQU2m27pi3Ej9KEQXaD5HhjAAAAqklEQVQoz41SWxLDIAh0RcFXTHL/yzZSO01LMpP9WJEVUNA9gfdXTioCSKE/kQQTQmf/ArRYva+xAcuPP37seFII2L7FN4BmXdHzlEPIpDHiZ0A7eIViPcw2QwqipkvMSdNEFBUE1bmMNOyE7FyFaIkAP4jHhhG80lvgkzBODTKpwhRMcexuR7fXzcp08UDq6GRbootp4oRtO3NNpd4NKtnR9hB6oaefweIFQU0EfnGDRoQAAAAASUVORK5CYII=';
const imgURL4 = 'https://user-images.githubusercontent.com/12878546/148736255-7193f89e-9caf-49c0-86b0-548209506bd6.gif';
const DEFAULT_VALUE = 'The 58-letter name Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch is the name of a town on Anglesey, an island of Wales.';

const styles = StyleSheet.create({
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
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#ffffff',
    padding: 10,
  },
  normalText: {
    fontSize: 14,
    lineHeight: 18,
    color: 'black',
  },
  buttonBar: {
    flexDirection: 'row',
    marginTop: 10,
    flexGrow: 1,
  },
  button: {
    height: 24,
    borderColor: '#4c9afa',
    borderWidth: 1,
    borderStyle: 'solid',
    flexGrow: 1,
    flexShrink: 1,
  },
  buttonText: {
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  customFont: {
    color: '#0052d9',
    fontSize: 32,
    fontFamily: 'TTTGB',
  },
});
let i = 0;
export default class TextExpo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fontSize: 16,
      textShadowColor: 'grey',
      textShadowOffset: {
        x: 1,
        y: 1,
      },
      scrollColor: 'gray',
      numberOfLines: 2,
      ellipsizeMode: undefined,
    };
    this.incrementFontSize = this.incrementFontSize.bind(this);
    this.decrementFontSize = this.decrementFontSize.bind(this);
    this.incrementLine = this.incrementLine.bind(this);
    this.decrementLine = this.decrementLine.bind(this);
    this.changeMode = this.changeMode.bind(this);
    this.changeColor = this.changeColor.bind(this);
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

  incrementLine() {
    const { numberOfLines } = this.state;
    if (numberOfLines < 6) {
      this.setState({
        numberOfLines: numberOfLines + 1,
      });
    }
  }

  decrementLine() {
    const { numberOfLines } = this.state;
    if (numberOfLines > 1) {
      this.setState({
        numberOfLines: numberOfLines - 1,
      });
    }
  }

  changeMode(mode) {
    this.setState({ ellipsizeMode: mode });
  }

  changeColor() {
    this.setState({ scrollColor: 'red' });
  }

  changeBreakStrategy(breakStrategy) {
    this.setState({ breakStrategy });
  }

  render() {
    const { fontSize, textShadowColor, textShadowOffset, numberOfLines, ellipsizeMode, breakStrategy,
      scrollColor } = this.state;
    const renderTitle = title => (
      <View style={styles.itemTitle}>
        <Text style>{title}</Text>
      </View>
    );
    return (
      <ScrollView style={{ padding: 10, color: scrollColor, fontFamily: 'TTTGB' }}>
        {renderTitle('shadow')}
        <View style={[styles.itemContent, { height: 60 }]} onClick={() => {
          let textShadowColor = 'red';
          let textShadowOffset = { x: 10, y: 1 };
          if (i % 2 === 1) {
            textShadowColor = 'grey';
            textShadowOffset = { x: 1, y: 1 };
          }
          i += 1;
          this.setState({
            textShadowColor,
            textShadowOffset,
          });
        }}>
          <Text style={[styles.normalText,
            { color: '#242424',
              textShadowOffset,
              // support declaring textShadowOffsetX & textShadowOffsetY separately
              // textShadowOffsetX: 1,
              // textShadowOffsetY: 1,
              textShadowRadius: 3,
              textShadowColor,
            }]}>Text shadow is grey with radius 3 and offset 1</Text>
        </View>
        {renderTitle('color')}
        <View style={[styles.itemContent, { height: 80 }]}>
          <Text style={[styles.normalText, { color: '#242424' }]}>Text color is black</Text>
          <Text style={[styles.normalText, { color: 'blue' }]}>Text color is blue</Text>
          <Text style={[styles.normalText, { color: 'rgb(228,61,36)' }]}>This is red</Text>
        </View>
        {renderTitle('fontSize')}
        <View style={[styles.itemContent, { height: 125, color: 'blue', fontFamily: 'not-support-fontstyle' }]}>
          <Text style={[styles.normalText, { fontSize }]}>
            { `Text fontSize is ${fontSize}` }
          </Text>
          <View style={styles.button} onClick={this.changeColor}>
            <Text style={styles.buttonText}>切换字体颜色</Text>
          </View>
          <View style={styles.button} onClick={this.incrementFontSize}>
            <Text style={styles.buttonText}>放大字体</Text>
          </View>
          <View style={styles.button} onClick={this.decrementFontSize}>
            <Text style={styles.buttonText}>缩小字体</Text>
          </View>
        </View>
        {renderTitle('fontStyle')}
        <View style={[styles.itemContent, { height: 100 }]}>
          <Text style={[styles.normalText, { fontStyle: 'normal' }]}>Text fontStyle is normal</Text>
          <Text style={[styles.normalText, { fontStyle: 'italic' }]}>Text fontStyle is italic</Text>
        </View>
        {renderTitle('numberOfLines and ellipsizeMode')}
        <View style={[styles.itemContent]}>
          <Text style={[styles.normalText, { marginBottom: 10 }]}>
            {`numberOfLines=${numberOfLines} | ellipsizeMode=${ellipsizeMode}`}
          </Text>
          <Text numberOfLines={numberOfLines} ellipsizeMode={ellipsizeMode} style={
            [styles.normalText,
              { lineHeight: undefined, backgroundColor: '#4c9afa', marginBottom: 10, paddingHorizontal: 10, paddingVertical: 5 }]}>
            <Text style={{ fontSize: 19, color: 'white' }}>先帝创业未半而中道崩殂，今天下三分，益州疲弊，此诚危急存亡之秋也。</Text>
            <Text>然侍卫之臣不懈于内，忠志之士忘身于外者，盖追先帝之殊遇，欲报之于陛下也。</Text>
          </Text>
          <Text numberOfLines={numberOfLines} ellipsizeMode={ellipsizeMode} style={[
            styles.normalText, { backgroundColor: '#4c9afa', marginBottom: 10, color: 'white', paddingHorizontal: 10, paddingVertical: 5 }]}>
            {'line 1\n\nline 3\n\nline 5'}
          </Text>
          <Text numberOfLines={numberOfLines} ellipsizeMode={ellipsizeMode} style={[styles.normalText,
            { lineHeight: undefined, backgroundColor: '#4c9afa', marginBottom: 10,
              paddingHorizontal: 10, paddingVertical: 5, verticalAlign: 'middle' }]}>
            <Image style={{ width: 24, height: 24 }} source={{ uri: imgURL2 }} />
            <Image style={{ width: 24, height: 24 }} source={{ uri: imgURL3 }} />
            <Text>Text + Attachment</Text>
          </Text>
          <View style={styles.buttonBar}>
            <View style={styles.button} onClick={this.incrementLine}>
              <Text style={styles.buttonText}>加一行</Text>
            </View>
            <View style={styles.button} onClick={this.decrementLine}>
              <Text style={styles.buttonText}>减一行</Text>
            </View>
          </View>
          <View style={styles.buttonBar}>
            <View style={styles.button} onClick={() => this.changeMode('clip')}>
              <Text style={styles.buttonText}>clip</Text>
            </View>
            <View style={styles.button} onClick={() => this.changeMode('head')}>
              <Text style={styles.buttonText}>head</Text>
            </View>
            <View style={styles.button} onClick={() => this.changeMode('middle')}>
              <Text style={styles.buttonText}>middle</Text>
            </View>
            <View style={styles.button} onClick={() => this.changeMode('tail')}>
              <Text style={styles.buttonText}>tail</Text>
            </View>
          </View>
        </View>
        {renderTitle('textDecoration')}
        <View style={[styles.itemContent, { height: 100 }]}>
          <Text numberOfLines={1} style={[styles.normalText, { textDecorationLine: 'underline', textDecorationStyle: 'dotted' }]}>
            underline
          </Text>
          <Text numberOfLines={1} style={[styles.normalText, { textDecorationLine: 'line-through', textDecorationColor: 'red' }]}>
            line-through
          </Text>
        </View>
        {renderTitle('LetterSpacing')}
        <View style={[styles.itemContent, { height: 100 }]}>
          <Text numberOfLines={1} style={[styles.normalText, { letterSpacing: -1 }]}>
            Text width letter-spacing -1
          </Text>
          <Text numberOfLines={1} style={[styles.normalText, { letterSpacing: 5 }]}>
            Text width letter-spacing 5
          </Text>
        </View>
        {renderTitle('Nest Text')}
        <View style={[styles.itemContent, { height: 100 }]}>
          <Text numberOfLines={3}>
            <Text numberOfLines={3} style={[styles.normalText, { color: '#4c9afa' }]}>#SpiderMan#</Text>
            <Text numberOfLines={3} style={styles.normalText}>
              Hello world, I am a spider man and I have five friends in other universe.
            </Text>
          </Text>
        </View>
        {renderTitle('Custom font')}
        <View style={[styles.itemContent, { height: 100 }]}>
          <Text numberOfLines={1} style={styles.customFont}>Hippy 跨端框架</Text>
        </View>
        <View style={[styles.itemContent, { height: 100 }]}>
          <Text numberOfLines={1} style={[styles.customFont, { fontWeight: 'bold' }]}>Hippy 跨端框架 粗体</Text>
        </View>
        <View style={[styles.itemContent, { height: 100 }]}>
          <Text numberOfLines={1} style={[styles.customFont, { fontStyle: 'italic' }]}>Hippy 跨端框架 斜体</Text>
        </View>
        <View style={[styles.itemContent, { height: 100 }]}>
          <Text numberOfLines={1} style={[styles.customFont, { fontWeight: 'bold', fontStyle: 'italic' }]}>Hippy 跨端框架 粗斜体</Text>
        </View>
        {renderTitle('Text Nested')}
        <View style={[styles.itemContent, { height: 150 }]}>
          <Text style={{ height: 100, lineHeight: 50 }}>
            <Text numberOfLines={1} style={styles.normalText}>后面有张图片</Text>
            <Image style={{ width: 70, height: 35 }} source={{ uri: imgURL }} />
            <Text numberOfLines={1} style={styles.customFont}>前面有张图片</Text>
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 10,
              paddingVertical: 5,
              backgroundColor: '#4c9afa',
            }}>
            <Image style={{ width: 24, height: 24, alignSelf: 'center' }} source={{ uri: imgURL2 }} />
            <Text style={{ fontSize: 15, alignItems: 'center', justifyContent: 'center' }}>Image+Text</Text>
          </View>
        </View>
        {Platform.OS === 'android' && renderTitle('breakStrategy')}
        {Platform.OS === 'android' && (
          <View style={styles.itemContent}>
            <Text
              style={[styles.normalText, { borderWidth: 1, borderColor: 'gray' }]}
              breakStrategy={breakStrategy}>
              {DEFAULT_VALUE}
            </Text>
            <Text style={styles.normalText}>{`breakStrategy: ${breakStrategy}`}</Text>
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
          </View>
        )}
        {renderTitle('verticalAlign')}
        <View style={[styles.itemContent, { height: Platform.OS === 'android' ? 160 : 70 }]}>
          <Text style={[styles.normalText,
            { lineHeight: 50, backgroundColor: '#4c9afa', paddingHorizontal: 10, paddingVertical: 5 }]}>
            <Image style={{ width: 24, height: 24, verticalAlign: 'top' }} source={{ uri: imgURL2 }} />
            <Image style={{ width: 18, height: 12, verticalAlign: 'middle' }} source={{ uri: imgURL2 }} />
            <Image style={{ width: 24, height: 12, verticalAlign: 'baseline' }} source={{ uri: imgURL2 }} />
            <Image style={{ width: 36, height: 24, verticalAlign: 'bottom' }} source={{ uri: imgURL2 }} />
            <Image style={{ width: 24, height: 24, verticalAlign: 'top' }} source={{ uri: imgURL4 }} />
            <Image style={{ width: 18, height: 12, verticalAlign: 'middle' }} source={{ uri: imgURL4 }} />
            <Image style={{ width: 24, height: 12, verticalAlign: 'baseline' }} source={{ uri: imgURL4 }} />
            <Image style={{ width: 36, height: 24, verticalAlign: 'bottom' }} source={{ uri: imgURL4 }} />
            <Text style={{ fontSize: 16, verticalAlign: 'top' }}>字</Text>
            <Text style={{ fontSize: 16, verticalAlign: 'middle' }}>字</Text>
            <Text style={{ fontSize: 16, verticalAlign: 'baseline' }}>字</Text>
            <Text style={{ fontSize: 16, verticalAlign: 'bottom' }}>字</Text>
          </Text>
          {Platform.OS === 'android' && (<>
            <Text>legacy mode:</Text>
            <Text style={[styles.normalText,
              { lineHeight: 50, backgroundColor: '#4c9afa', marginBottom: 10, paddingHorizontal: 10, paddingVertical: 5 }]}>
              <Image style={{ width: 24, height: 24, verticalAlignment: 0 }} source={{ uri: imgURL2 }} />
              <Image style={{ width: 18, height: 12, verticalAlignment: 1 }} source={{ uri: imgURL2 }} />
              <Image style={{ width: 24, height: 12, verticalAlignment: 2 }} source={{ uri: imgURL2 }} />
              <Image style={{ width: 36, height: 24, verticalAlignment: 3 }} source={{ uri: imgURL2 }} />
              <Image style={{ width: 24, height: 24, top: -10 }} source={{ uri: imgURL4 }} />
              <Image style={{ width: 18, height: 12, top: -5 }} source={{ uri: imgURL4 }} />
              <Image style={{ width: 24, height: 12 }} source={{ uri: imgURL4 }} />
              <Image style={{ width: 36, height: 24, top: 3 }} source={{ uri: imgURL4 }} />
              <Text style={{ fontSize: 16 }}>字</Text>
              <Text style={{ fontSize: 16 }}>字</Text>
              <Text style={{ fontSize: 16 }}>字</Text>
              <Text style={{ fontSize: 16 }}>字</Text>
            </Text>
          </>)}
        </View>
        {renderTitle('tintColor & backgroundColor')}
        <View style={[styles.itemContent]}>
          <Text style={[styles.normalText,
            { lineHeight: 30, backgroundColor: '#4c9afa', paddingHorizontal: 10, paddingVertical: 5 }]}>
            <Image style={{ width: 24, height: 24, verticalAlign: 'middle', tintColor: 'orange' }} source={{ uri: imgURL2 }} />
            <Image style={{ width: 24, height: 24, verticalAlign: 'middle', tintColor: 'orange', backgroundColor: '#ccc' }} source={{ uri: imgURL2 }} />
            <Image style={{ width: 24, height: 24, verticalAlign: 'middle', backgroundColor: '#ccc' }} source={{ uri: imgURL2 }} />
            <Text style={{ verticalAlign: 'middle', backgroundColor: '#090' }}>text</Text>
          </Text>
          {Platform.OS === 'android' && (<>
            <Text>legacy mode:</Text>
            <Text style={[styles.normalText,
              { lineHeight: 30, backgroundColor: '#4c9afa', marginBottom: 10, paddingHorizontal: 10, paddingVertical: 5 }]}>
              <Image style={{ width: 24, height: 24, tintColor: 'orange' }} source={{ uri: imgURL2 }} />
              <Image style={{ width: 24, height: 24, tintColor: 'orange', backgroundColor: '#ccc' }} source={{ uri: imgURL2 }} />
              <Image style={{ width: 24, height: 24, backgroundColor: '#ccc' }} source={{ uri: imgURL2 }} />
            </Text>
          </>)}
        </View>
        {renderTitle('margin')}
        <View style={[styles.itemContent]}>
          <Text style={[
            { lineHeight: 50, backgroundColor: '#4c9afa', marginBottom: 5 }]}>
            <Image style={{ width: 24, height: 24, verticalAlign: 'top', backgroundColor: '#ccc', margin: 5 }} source={{ uri: imgURL2 }} />
            <Image style={{ width: 24, height: 24, verticalAlign: 'middle', backgroundColor: '#ccc', margin: 5 }} source={{ uri: imgURL2 }} />
            <Image style={{ width: 24, height: 24, verticalAlign: 'baseline', backgroundColor: '#ccc', margin: 5 }} source={{ uri: imgURL2 }} />
            <Image style={{ width: 24, height: 24, verticalAlign: 'bottom', backgroundColor: '#ccc', margin: 5 }} source={{ uri: imgURL2 }} />
          </Text>
          {Platform.OS === 'android' && (<>
            <Text>legacy mode:</Text>
            <Text style={[styles.normalText,
              { lineHeight: 50, backgroundColor: '#4c9afa', marginBottom: 10, paddingHorizontal: 10, paddingVertical: 5 }]}>
              <Image style={{ width: 24, height: 24, verticalAlignment: 0, backgroundColor: '#ccc', margin: 5 }} source={{ uri: imgURL2 }} />
              <Image style={{ width: 24, height: 24, verticalAlignment: 1, backgroundColor: '#ccc', margin: 5 }} source={{ uri: imgURL2 }} />
              <Image style={{ width: 24, height: 24, verticalAlignment: 2, backgroundColor: '#ccc', margin: 5 }} source={{ uri: imgURL2 }} />
              <Image style={{ width: 24, height: 24, verticalAlignment: 3, backgroundColor: '#ccc', margin: 5 }} source={{ uri: imgURL2 }} />
            </Text>
          </>)}
        </View>
      </ScrollView>
    );
  }
}
