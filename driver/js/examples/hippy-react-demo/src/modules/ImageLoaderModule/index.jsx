import React from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  ImageLoaderModule,
} from '@hippy/react';

const testUrl = 'https://user-images.githubusercontent.com/12878546/148736102-7cd9525b-aceb-41c6-a905-d3156219ef16.png';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
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
  wrapper: {
    borderColor: '#eee',
    borderWidth: 1,
    borderStyle: 'solid',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginVertical: 10,
  },
  infoText: {
    marginTop: 8,
    marginBottom: 8,
    color: '#333',
  },
  button: {
    backgroundColor: '#4c9afa',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: 'white',
  },
});

function formatResult(value) {
  if (value == null) {
    return 'null';
  }
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch (err) {
    return `${value}`;
  }
}

export default class ImageLoaderModuleExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sizeResultText: 'Click "Get Image Size" to call ImageLoaderModule.getSize',
      prefetchResultText: 'Click "Prefetch Image" to call ImageLoaderModule.prefetch',
    };
  }

  async getImageSize() {
    try {
      const result = await ImageLoaderModule.getSize(testUrl);
      this.setState({
        sizeResultText: formatResult(result),
      });
    } catch (err) {
      this.setState({
        sizeResultText: `error: ${formatResult(err)}`,
      });
    }
  }

  prefetchImage() {
    try {
      ImageLoaderModule.prefetch(testUrl);
      this.setState({
        prefetchResultText: 'prefetch request sent',
      });
    } catch (err) {
      this.setState({
        prefetchResultText: `error: ${formatResult(err)}`,
      });
    }
  }

  renderTitle(title) {
    return (
      <View style={styles.itemTitle}>
        <Text>{title}</Text>
      </View>
    );
  }

  render() {
    const { sizeResultText, prefetchResultText } = this.state;

    return (
      <ScrollView style={styles.container}>
        {this.renderTitle('ImageLoaderModule')}
        <View style={styles.wrapper}>
          <Text style={styles.infoText}>{`Test URL: ${testUrl}`}</Text>
          <View style={styles.button} onClick={() => this.getImageSize()}>
            <Text style={styles.buttonText}>Get Image Size</Text>
          </View>
          <Text style={styles.infoText}>{`getSize result: ${sizeResultText}`}</Text>
          <View style={styles.button} onClick={() => this.prefetchImage()}>
            <Text style={styles.buttonText}>Prefetch Image</Text>
          </View>
          <Text style={styles.infoText}>{`prefetch status: ${prefetchResultText}`}</Text>
        </View>
      </ScrollView>
    );
  }
}
