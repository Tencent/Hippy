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

import React, { useState, useEffect } from 'react';
import { formatWebStyle } from '../adapters/transfer';
import ImageLoader, { LoadError } from '../adapters/image-loader';
import { LayoutEvent, StyleSheet } from '../types';
import { View, ViewProps } from './view';


interface ImageProp {
  style: StyleSheet;
  children?: any;
  onError?: LoadError;
  defaultSource?: string;
  source?: { uri: string };
  capInsets?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  onLoad?: (e: { width: number; height: number; url: string }) => void;
  onLayout?: (e: LayoutEvent) => void;
  onLoadStart?: Function;
  onLoadEnd?: Function;
  onProgress?: Function;
  onTouchDown?: Function;
  onTouchMove?: Function;
  onTouchEnd?: Function;
  onTouchCancel?: Function;
}

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
const Image: React.FC<ImageProp> & { resizeMode: Record<string, string> } = (props: ImageProp) => {
  const { onLoadStart, source, defaultSource, onLoad, onError, onLoadEnd, resizeMode, children, style } = props;
  const initImageUrl = source.uri ? source.uri : defaultSource;
  const [imageUrl, setImageUrl] = useState(initImageUrl);
  const copyProps = { ...props };
  copyProps.style = formatWebStyle([styles.root, formatWebStyle(style)]);

  const onImageLoad = (e: any) => {
    setImageUrl(source.uri);
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
  };

  const onImageLoadError = () => {
    if (onError) {
      onError({
        nativeEvent: {
          error: `Failed to load resource ${resolveAssetUri(source)}`,
        },
      });
    }
    if (onLoadEnd) {
      onLoadEnd();
    }
    if (defaultSource) {
      setImageUrl(defaultSource);
    }
  };

  useEffect(() => {
    if (onLoadStart) {
      onLoadStart();
    }
    if (source) {
      ImageLoader.load(source.uri, onImageLoad, onImageLoadError);
    }
  }, [source]);


  const finalResizeMode = resizeMode || copyProps.style?.resizeMode || ImageResizeMode.cover;
  // delete view unsupported prop
  delete copyProps.source;
  delete copyProps.onLoad;
  delete copyProps.onLoadEnd;
  delete copyProps.defaultSource;
  delete copyProps.onError;
  delete copyProps.resizeMode;
  // unsuported prop in Image
  delete copyProps.onProgress;
  delete copyProps.capInsets;
  const viewProps: ViewProps = { ...copyProps } as ViewProps;


  return (
    <View {...viewProps}>
      <View
        style={[
          styles.image,
          resizeModeStyles[finalResizeMode],
          { backgroundImage: `url(${imageUrl}` },
        ]}
      />
      {children}
    </View>
  );
};
Image.resizeMode = ImageResizeMode;

export default Image;
