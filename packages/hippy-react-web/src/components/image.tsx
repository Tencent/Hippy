/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { formatWebStyle } from '../adapters/transfer';
import applyLayout from '../adapters/apply-layout';
import ImageLoader from '../adapters/image-loader';
import { View } from './view';

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

interface Props {
  style?: HippyTypes.Style;
  withRef: React.Ref<any>
  displayInWeb?: boolean;
  source: string | { uri: string }
  sources?: any[];
  onLoadStart?(): void;
  onLoad?(param: object): void;
  onLoadEnd?(): void;
  onError?(param: object): void;
  resizeMode?: string;
  children?: any[];
  defaultSource?: string
}

interface State {
  isLoadSuccess: boolean;
  imageUrl: string;
  prevImageUrl: string;
}

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

  constructor(props: Props) {
    super(props);
    const initImageUrl = props.source && typeof props.source !== 'string' ? props.source.uri : '';
    this.state = {
      isLoadSuccess: false,
      imageUrl: initImageUrl,
      prevImageUrl: initImageUrl,
    } as State;
    this.onLoad = this.onLoad.bind(this);
    this.onError = this.onError.bind(this);
  }

  componentDidMount() {
    const {
      source,
      onLoadStart,
    } = this.props as Props;
    if (onLoadStart) {
      onLoadStart();
    }
    if (typeof source !== 'string' && source) {
      ImageLoader.load(source.uri, this.onLoad, this.onError);
    }
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    if (nextProps.source
        && typeof nextProps.source !== 'string'
        && nextProps.source.uri !== prevState.imageUrl) {
      return {
        imageUrl: nextProps.source.uri,
        prevImageUrl: prevState.imageUrl,
      };
    }
    return null;
  }

  componentDidUpdate() {
    const { imageUrl, prevImageUrl } = this.state as State;
    if (imageUrl !== prevImageUrl) {
      ImageLoader.load(imageUrl, this.onLoad, this.onError);
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        prevImageUrl: imageUrl,
      });
    }
  }

  onLoad(e: any) {
    const { onLoad, onLoadEnd } = this.props as Props;
    this.setState({
      isLoadSuccess: true,
    });
    if (onLoad) {
      const path = e.path || (e.composedPath && e.composedPath());
      const imageInfo = path[0];
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
    const { onError, onLoadEnd, source } = this.props as Props;
    if (onError) {
      onError({
        nativeEvent: {
          error: `Failed to load resource ${resolveAssetUri(source)} (404)`,
        },
      });
    }
    if (onLoadEnd) {
      onLoadEnd();
    }
  }

  render() {
    let { style } = this.props as Props;
    const { isLoadSuccess } = this.state as State;
    const {
      source, sources, resizeMode, children, defaultSource = '',
    } = this.props as Props;
    if (style) {
      style = formatWebStyle(style);
    }
    const newProps = Object.assign({}, this.props, {
      style: formatWebStyle([styles.root, style]),
    });

    if (source && typeof source !== 'string') {
      (newProps as any).src = source.uri;
    } else if (sources && Array.isArray(sources)) {
      (newProps as any).src = sources[0].uri;
    }

    if (!isLoadSuccess) {
      (newProps as any).src = defaultSource;
    }

    const finalResizeMode = resizeMode || (newProps as any).style.resizeMode || ImageResizeMode.cover;

    delete (newProps as any).source;
    delete (newProps as any).sources;
    delete (newProps as any).onLoad;
    delete (newProps as any).onLayout;
    delete (newProps as any).onLoadEnd;
    delete (newProps as any).defaultSource;

    return (
      <View {...newProps}>
        <View
          // @ts-ignore
          style={[
            styles.image,
            // @ts-ignore
            resizeModeStyles[finalResizeMode],
            { backgroundImage: `url(${(newProps as any).src}` },
          ]}
        />
        {children}
      </View>
    );
  }
}


export default applyLayout(Image);
