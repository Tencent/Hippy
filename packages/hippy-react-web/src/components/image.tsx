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
import { LayoutEvent } from '../types';
import { TouchEvent } from '../modules/use-responder-events/types';
import useResponderEvents from '../modules/use-responder-events';
import useElementLayout from '../modules/use-element-layout';
import { isFunc } from '../utils/validation';


type ImageResizeMode = 'cover' | 'contain' | 'stretch' | 'repeat' | 'center' | 'none';
interface ImageProp {
  style: HippyTypes.Style;
  tintColor?: HippyTypes.color;
  children?: any;
  onError?: LoadError;
  defaultSource?: string;
  source?: { uri: string };
  capInsets?: any;
  resizeMode?: ImageResizeMode;
  onLoad?: (e: { width: number; height: number; url: string }) => void;
  onLayout?: (e: LayoutEvent) => void;
  onLoadStart?: Function;
  onLoadEnd?: Function;
  onProgress?: Function;
  onTouchDown?: (e: TouchEvent) => void;
  onTouchMove?: (e: TouchEvent) => void;
  onTouchEnd?: (e: TouchEvent) => void;
  onTouchCancel?: (e: TouchEvent) => void;
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
const Image: React.FC<ImageProp> = React.forwardRef((props: ImageProp, ref) => {
  const { onLoadStart, source = { uri: '' }, defaultSource, onLoad, onError, onLoadEnd = () => null, resizeMode = 'none', children, style = {} } = props;

  const imgRef = useRef(null);
  const { onTouchDown, onTouchEnd, onTouchCancel, onTouchMove, onLayout } = props;
  useResponderEvents(imgRef, { onTouchCancel, onTouchDown, onTouchEnd, onTouchMove });
  useElementLayout(imgRef, onLayout);

  const [loading, setLoading] = useState(true);
  const [isLoadFailed, setIsLoadFailed] = useState(false);
  const imgstyle = formatWebStyle(style);

  const onImageLoadError = () => {
    if (onError && isFunc(onError)) {
      onError({
        nativeEvent: {
          error: `Failed to load resource ${resolveAssetUri(source)}`,
        },
      });
    }
    onLoadEnd();
    setIsLoadFailed(true);
  };

  const onImageLoad = (e: any) => {
    if (onLoad && isFunc(onLoad)) {
      const { path = [] } = e.nativeEvent;
      const [imageInfo] = path;
      onLoad({
        width: imageInfo.naturalWidth,
        height: imageInfo.naturalHeight,
        url: imageInfo.src,
      });
    }
    onLoadEnd();
    setLoading(false);
  };

  const renderImg = () => {
    const baseStyle = formatWebStyle([styles.image, resizeModeStyles[resizeMode]]);
    const style = formatWebStyle([baseStyle, imgstyle]);
    return (
      !isLoadFailed && <img
        src={source.uri}
        style={style}
        ref={imgRef} onError={onImageLoadError}
        onLoad={onImageLoad}>
        {children}
      </img>
    );
  };

  const renderPlaceholder = () => {
    const style = formatWebStyle([styles.placeholder, resizeModeStyles[resizeMode], imgstyle, styles.absolute]);
    if (isLoadFailed) {
      style.position = 'relative';
    }
    return (
      defaultSource && <img style={style} src={defaultSource}></img>
    );
  };


  useEffect(() => {
    if (onLoadStart) {
      onLoadStart();
    }
  }, [source]);

  React.useImperativeHandle(ref, () => ({
    getSize: ImageLoader.getSize,
    prefetch: ImageLoader.prefetch,
  }));

  return (
    <div style={formatWebStyle(styles.root)}>
     {renderImg()}
     {loading && renderPlaceholder()}
    </div>
  );
});

Image.displayName = 'Image';
// @ts-ignore
Image.resizeMode = ImageResizeMode;

export default Image;
