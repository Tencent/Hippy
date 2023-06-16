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

import React, { useState, useEffect, useRef } from 'react';
import { formatWebStyle } from '../adapters/transfer';
import ImageLoader, { LoadError } from '../adapters/image-loader';
import { LayoutableProps, TouchableProps, ClickableProps } from '../types';
import useResponderEvents from '../modules/use-responder-events';
import useElementLayout from '../modules/use-element-layout';
import { isFunc, noop } from '../utils';


type ImageResizeMode = 'cover' | 'contain' | 'stretch' | 'center' | 'none';
export interface ImageProps extends LayoutableProps, TouchableProps, ClickableProps {
  [key: string]: any;
  style: HippyTypes.Style;
  tintColor?: HippyTypes.color;
  children?: any;
  onError?: LoadError;
  defaultSource?: string;
  source?: { uri: string };
  capInsets?: any;
  resizeMode?: ImageResizeMode;
  onLoad?: (e: { width: number; height: number; url: string }) => void;
  onLoadStart?: Function;
  onLoadEnd?: Function;
  onProgress?: Function;
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
    position: 'relative',
    display: 'inline-block',
  },
  absolute: {
    position: 'absolute',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    top: '0',
    left: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    display: 'block',
    height: '100%',
    width: '100%',
  },
};

const resizeModeStyles: Record<ImageResizeMode, any> = {
  center: {
    objectFit: 'contain',
  },
  contain: {
    objectFit: 'contain',
  },
  cover: {
    objectFit: 'cover',
  },
  stretch: {
    objectFit: 'fill',
  },
  none: {},
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
const Image: React.FC<ImageProps> = React.forwardRef((props: ImageProps, ref) => {
  const {
    onLoadStart, source = { uri: '' }, defaultSource, onLoad, onError, onLoadEnd = noop, resizeMode = 'none', children, style = {},
    onTouchDown, onTouchEnd, onTouchCancel, onTouchMove, onLayout, ...restProps
  } = props;

  const imgRef = useRef<null | HTMLImageElement>(null);
  useResponderEvents(imgRef, { onTouchCancel, onTouchDown, onTouchEnd, onTouchMove });
  useElementLayout(imgRef, onLayout);

  const [imgSource, setImgSource] = useState(defaultSource ? { uri: defaultSource } : source);

  const onImageLoad = () => {
    if (onLoad && isFunc(onLoad)) {
      const imgInfo = { width: 0, height: 0, url: source.uri };
      if (imgRef.current) {
        const { width, height } = imgRef.current;
        imgInfo.width = width;
        imgInfo.height = height;
      }
      onLoad(imgInfo);
    }
    onLoadEnd();
  };

  const onImageLoadError = () => {
    if (onError && isFunc(onError)) {
      onError({
        nativeEvent: {
          error: `Failed to load resource ${resolveAssetUri(source)}`,
        },
      });
    }
    onLoadEnd();
  };

  // load source url when provide defaultSource
  if (imgSource.uri !== source.uri) {
    ImageLoader.load(source.uri, () => {
      setImgSource(source);
      onImageLoad();
    }, onImageLoadError);
  }

  const imgStyle = formatWebStyle(style);
  const baseStyle = formatWebStyle([styles.image, resizeModeStyles[resizeMode]]);

  useEffect(() => {
    if (onLoadStart) {
      onLoadStart();
    }
  }, [source]);

  React.useImperativeHandle(ref, () => ({
    getSize: ImageLoader.getSize,
    prefetch: ImageLoader.prefetch,
  }));

  // delete unsupported props
  delete restProps.tintColor;
  delete restProps.onProgress;
  delete restProps.capInsets;

  return (
    // @ts-ignore
    <img
      {...restProps}
      src={imgSource.uri}
      style={formatWebStyle([baseStyle, imgStyle]) }
      ref={imgRef} onError={onImageLoadError}
      onLoad={onImageLoad}>
      {children}
    </img>
  );
});

Image.displayName = 'Image';
// @ts-ignore
Image.resizeMode = ImageResizeMode;
// @ts-ignore
Image.getSize = ImageLoader.getSize;
// @ts-ignore
Image.prefetch = ImageLoader.prefetch;

export default Image;
