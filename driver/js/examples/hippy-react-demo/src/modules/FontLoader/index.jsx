import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  FontLoaderModule,
} from '@hippy/react';

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
  wrapper: {
    borderColor: '#eee',
    borderWidth: 1,
    borderStyle: 'solid',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 10,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  infoContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 5,
    marginBottom: 5,
    flexWrap: 'wrap',
  },
  text_style: {
    fontSize: 16,
  },
  input_url_style: {
    height: 60,
    marginVertical: 10,
    fontSize: 16,
    color: '#242424',
  },
  input_font_style: {
    height: 30,
    marginVertical: 10,
    fontSize: 16,
    color: '#242424',
  },
});

export default class LoadFontExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fontFamily: '',
      inputFontFamily: '',
      fontUrl: '',
      loadState: '',
    };
  }

  fillExample() {
    this.setState({ inputFontFamily: 'HYHuaXianZi J' });
    this.setState({ fontUrl: 'https://zf.sc.chinaz.com/Files/DownLoad/upload/2024/1009/hanyihuaxianzijianti.ttf' });
  }

  async loadFont() {
    this.setState({ fontFamily: this.state.inputFontFamily });
    await FontLoaderModule.load(this.state.fontFamily, this.state.fontUrl)
    .then(() => {
      this.setState({ loadState: 'Success' });
    })
    .catch((error) => {
      this.setState({ loadState: error });
    });
  }

  render() {
    return (
      <ScrollView style={{ paddingHorizontal: 10 }}>
        <View style={styles.itemTitle}>
          <Text>通过组件fontUrl属性动态下载并使用字体</Text>
        </View>
        <Text style={styles.text_style}
              fontFamily='HYHuaXianZi F' 
              fontUrl='https://zf.sc.chinaz.com/Files/DownLoad/upload/2024/1009/hanyihuaxianzifanti.ttf'>
          This sentence will use font 'HYHuaXianZi F' downloaded dynamically according to 'fontUrl' property.
        </Text>
        <Text style={styles.text_style}
              fontFamily='HYHuaXianZi F'>
          这句话将使用通过fontUrl属性下载的汉仪花仙子繁体字体.
        </Text>
        <View style={styles.itemTitle}>
          <Text>下载并使用字体</Text>
        </View>
        <Text style={styles.text_style} fontFamily={this.state.fontFamily}>
          This sentence will be set the specific font after download.
        </Text>
        <Text style={styles.text_style} fontFamily={this.state.fontFamily}>
          这句话将用指定的下载字体显示。
        </Text>
        <TextInput
          style={styles.input_font_style}
          fontFamily={this.state.fontFamily}
          placeholder="Input font family"
          value={this.state.inputFontFamily}
          onChangeText={(text) => this.setState({inputFontFamily: text})}
        />
        <TextInput
          style={styles.input_url_style}
          placeholder="Input font url"
          value={this.state.fontUrl}
          onChangeText={(text) => this.setState({fontUrl: text})}
        />
        <View style={[styles.wrapper]}
        >
          <View style={[styles.infoContainer]}>
          <View style={{ backgroundColor: 'grey', padding: 10, borderRadius: 10, marginRight: 10 }} onClick={() => this.fillExample()}>
              <Text style={{ color: 'white' }}>填充示例</Text>
            </View>
            <View style={{ backgroundColor: 'grey', padding: 10, borderRadius: 10, marginRight: 10 }} onClick={() => this.loadFont()}>
              <Text style={{ color: 'white' }}>下载字体</Text>
            </View>
          </View>
        </View>
        <Text>load state: {this.state.loadState}</Text>
      </ScrollView>
    );
  }
}
