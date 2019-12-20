import React from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  Clipboard,
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
  defaultText: {
    marginVertical: 4,
    fontSize: 18,
    lineHeight: 24,
    color: '#242424',
  },
  copiedText: {
    color: '#aaa',
  },
  button: {
    backgroundColor: '#4c9afa',
    borderRadius: 4,
    height: 30,
    marginVertical: 4,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
  },
});

export default class ClipboardDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasCopied: false,
      text: 'Winter is coming',
      clipboardText: '快点上面的按钮啊魂淡',
    };
  }

  render() {
    const renderTitle = title => (
      <View style={styles.itemTitle}>
        <Text>{title}</Text>
      </View>
    );
    const { hasCopied, text, clipboardText } = this.state;
    const copiedText = hasCopied ? '   (已复制)   ' : '';
    return (
      <ScrollView style={{ padding: 10 }}>
        {renderTitle('文本复制到剪贴板')}
        <Text style={styles.defaultText}>{text}</Text>
        <View
          style={styles.button}
          onClick={() => {
            Clipboard.setString(text);
            this.setState({
              hasCopied: true,
            });
          }}
        >
          <Text style={styles.buttonText}>{`点击复制以上文案${copiedText}`}</Text>
        </View>
        {renderTitle('获取剪贴板内容')}
        <View
          style={styles.button}
          onClick={async () => {
            const str = await Clipboard.getString();
            this.setState({
              clipboardText: str,
            });
          }}
        >
          <Text style={styles.buttonText}>点击获取剪贴板内容</Text>
        </View>
        <Text style={[styles.defaultText, styles.copiedText]}>{clipboardText}</Text>
      </ScrollView>
    );
  }
}
