import React from 'react';
import {
  ScrollView,
  Text,
  Image,
  StyleSheet,
} from '@hippy/react';

// Import the image to base64 for defaultSource props.
import defaultSource from './defaultSource.jpg';
import HippyLogoImg from './hippyLogoWhite.png';

const imageUrl = 'https://user-images.githubusercontent.com/12878546/148736102-7cd9525b-aceb-41c6-a905-d3156219ef16.png';

const styles = StyleSheet.create({
  container_style: {
    alignItems: 'center',
  },
  image_style: {
    width: 300,
    height: 180,
    margin: 16,
    borderColor: '#4c9afa',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 4,
  },
  info_style: {
    marginTop: 15,
    marginLeft: 16,
    fontSize: 16,
    color: '#4c9afa',
  },
  img_result: {
    width: 300,
    marginTop: -15,
    marginLeft: 16,
    fontSize: 16,
    color: '#4c9afa',
    borderColor: '#4c9afa',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 4,
  },
});

export default class ImageExpo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gifLoadResult: {},
    };
  }
  render() {
    const { width: gifWidth, height: gifHeight, url: gifUrl } = this.state.gifLoadResult;

    return (
      <ScrollView style={styles.container_style}>
        <Text style={styles.info_style}>Contain:</Text>
        <Image
          style={[styles.image_style]}
          resizeMode={Image.resizeMode.contain}
          defaultSource={defaultSource}
          source={{ uri: imageUrl }}
          onProgress={(e) => {
            console.log('onProgress', e);
          }}
          onLoadStart={() => {
            console.log('image onloadStart');
          }}
          onLoad={() => {
            console.log('image onLoad');
          }}
          onError={(e) => {
            console.log('image onError', e);
          }}
          onLoadEnd={() => {
            console.log('image onLoadEnd');
          }}
        />
        <Text style={styles.info_style}>Cover:</Text>
        <Image
          style={[styles.image_style]}
          defaultSource={defaultSource}
          source={{ uri: imageUrl }}
          resizeMode={Image.resizeMode.cover}
        />
        <Text style={styles.info_style}>Center:</Text>
        <Image
          style={[styles.image_style]}
          defaultSource={defaultSource}
          source={{ uri: imageUrl }}
          resizeMode={Image.resizeMode.center}
        />
        <Text style={styles.info_style}>CapInsets:</Text>
        <Image
          style={[styles.image_style]}
          defaultSource={defaultSource}
          source={{ uri: imageUrl }}
          capInsets={{
            top: 50,
            left: 50,
            bottom: 50,
            right: 50,
          }}
          resizeMode={Image.resizeMode.cover}
        />
        <Text style={styles.info_style}>TintColor:</Text>
        <Image
          style={[styles.image_style, { tintColor: '#4c9afa99' }]}
          defaultSource={defaultSource}
          source={{ uri: HippyLogoImg }}
          resizeMode={Image.resizeMode.center}
        />
        <Text style={styles.info_style}>Cover GIF:</Text>
        <Image
          style={[styles.image_style]}
          resizeMode={Image.resizeMode.cover}
          defaultSource={defaultSource}
          source={{ uri: 'https://user-images.githubusercontent.com/12878546/148736255-7193f89e-9caf-49c0-86b0-548209506bd6.gif' }}
          onLoad={(result) => {
            console.log(`gif onLoad result: ${result}`);
            const { width, height, url } = result;
            this.setState({
              gifLoadResult: {
                width,
                height,
                url,
              },
            });
          }}
        />
        <Text style={styles.img_result}>{ `gifLoadResult: { width: ${gifWidth}, height: ${gifHeight}, url: ${gifUrl} }` }</Text>
      </ScrollView>
    );
  }
}
