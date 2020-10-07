import React from 'react';
import { formatWebStyle } from '../adapters/transfer';
import { View } from './view';
import applyLayout from '../adapters/apply-layout';
import ImageLoader from '../adapters/image-loader';

const ImageResizeMode = {
  center: 'center',
  contain: 'contain',
  cover: 'cover',
  none: 'none',
  repeat: 'repeat',
  stretch: 'stretch',
};

const styles = {
  root: {
    flexBasis: 'auto',
    overflow: 'hidden',
    zIndex: 0,
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    height: '100%',
    width: '100%',
  },
};

const resizeModeStyles = {
  center: {
    backgroundSize: 'auto',
  },
  contain: {
    backgroundSize: 'contain',
  },
  cover: {
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
  },
  none: {
    backgroundPosition: '0 0',
    backgroundSize: 'auto',
  },
  repeat: {
    backgroundPosition: '0 0',
    backgroundRepeat: 'repeat',
    backgroundSize: 'auto',
  },
  stretch: {
    backgroundSize: '100% 100%',
  },
};

const svgDataUriPattern = /^(data:image\/svg\+xml;utf8,)(.*)/;
const resolveAssetUri = (source: string | { uri: string }) => {
  let finalUri = '';
  if (typeof source === 'string') {
    finalUri = source;
  } else if (source && typeof source.uri === 'string') {
    finalUri = source.uri;
  }

  if (finalUri) {
    const match = finalUri.match(svgDataUriPattern);
    // inline SVG markup may contain characters (e.g., #, ") that need to be escaped
    if (match) {
      const [, prefix, svg] = match;
      const encodedSvg = encodeURIComponent(svg);
      return `${prefix}${encodedSvg}`;
    }
  }
  return finalUri;
};

/**
 * A React component for displaying different types of images, including network images,
 * static resources, temporary local images, and images from local disk, such as the camera roll.
 * @noInheritDoc
 */
export class Image extends React.Component {
  static get resizeMode() {
    return {
      contain: 'contain',
      cover: 'cover',
      stretch: 'stretch',
      center: 'center',
      repeat: 'repeat',
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      isLoadSuccess: false,
    }
    this.onLoad = this.onLoad.bind(this);
    this.onError = this.onError.bind(this);
  }

  componentDidMount() {
    const {
      source,
      onLoadStart,
    } = this.props;
    if (onLoadStart) {
      onLoadStart();
    }
    ImageLoader.load(source.uri, this.onLoad, this.onError);
  }

  onLoad(e) {
    const { onLoad, onLoadEnd } = this.props;
    this.setState({
      isLoadSuccess: true
    })
    if (onLoad) {
      const imageInfo = e.path[0];
      onLoad({
        width: imageInfo.naturalWidth,
        height: imageInfo.naturalHeight,
        url: imageInfo.src,
      });
    }
    if (onLoadEnd) {
      onLoadEnd();
    }
  }

  onError() {
    const { onError, onLoadEnd, source } = this.props;
    if (onError) {
      onError({
        nativeEvent: {
          error: `Failed to load resource ${resolveAssetUri(source)} (404)`,
        },
      });
    }
    onLoadEnd();
  }

  render() {
    let {
      style,
    } = this.props;
    const {
      source, sources, resizeMode, children, defaultSource
    } = this.props;
    if (style) {
      style = formatWebStyle(style);
    }
    const newProps = Object.assign({}, this.props, {
      style: formatWebStyle([styles.root, style]),
    });

    if (source) {
      newProps.src = source.uri;
    } else if (sources && Array.isArray(sources)) {
      newProps.src = sources[0].uri;
    }

    if(!this.state.isLoadSuccess) {
      newProps.src = defaultSource;
    }

    const finalResizeMode = resizeMode || newProps.style.resizeMode || ImageResizeMode.cover;

    delete newProps.source;
    delete newProps.sources;
    delete newProps.onLoad;
    delete newProps.onLayout;
    delete newProps.onLoadEnd;
    return (
      <View {...newProps}>
        <View
          style={[
            styles.image,
            resizeModeStyles[finalResizeMode],
            { backgroundImage: `url(${newProps.src}` },
          ]}
        />
        {children}
      </View>
    );
  }
}


export default applyLayout(Image);
