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

import React, { LegacyRef } from 'react';
import { LayoutableProps, ClickableProps, Platform } from '../types';
import { prefetch, getSize } from '../modules/image-loader-module';
import { Device } from '../native';
import { warn, convertImgUrl } from '../utils';
import StyleSheet from '../modules/stylesheet';
import View from './view';

interface Size {
  width: number;
  height: number;
}

export interface ImageSource {
  uri: string;
}

export interface ImageProps extends LayoutableProps, ClickableProps {
  /**
   * Single image source
   */
  src?: string;

  /**
   * Image source object
   */
  source?: ImageSource | ImageSource[] | null;

  srcs?: string[];
  sources?: ImageSource[];

  /**
   * Image placeholder when image is loading.
   * Support base64 image only.
   */
  defaultSource?: string | undefined;

  /**
   * Fill color to the image
   */
  tintColor?: HippyTypes.tintColor;
  tintColors?: HippyTypes.tintColors;

  /**
   * Image style when `Image` have other children.
   */
  imageStyle?: HippyTypes.ImageStyleProp;

  /**
   * Image ref when `Image` have other children.
   */
  imageRef?: React.ReactNode;

  /**
   * Image resize mode, as same as containMode
   */
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';

  /**
   * When the image is resized, the corners of the size specified by capInsets
   * will stay a fixed size, but the center content and borders of the image will be stretched.
   * This is useful for creating resizable rounded buttons, shadows, and other resizable assets.
   */
  capInsets?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  style:  HippyTypes.ImageStyleProp;
  /**
   * Invoked on `Image` is loaded.
   */
  onLoad?: () => void;

  /**
   * Invoke on `Image` is end of loading.
   */
  onLoadEnd?: () => void;

  /**
   * Invoke on `Image` is start to loading.
   */
  onLoadStart?: () => void;

  /**
   * Invoke on loading of `Image` get error.
   *
   * @param {Object} evt - Loading error data.
   * @param {string} evt.error - Loading error message.
   */
  onError?: (evt: { error: string }) => void;

  /**
   * Invoke on Image is loading.
   *
   * @param {Object} evt - Image loading progress data.
   * @param {number} evt.loaded - The image is loaded.
   * @param {number} evt.total - The loaded progress.
   */
  onProgress?: (evt: { loaded: number; total: number }) => void;
}

/**
 * A React component for displaying different types of images, including network images,
 * static resources, temporary local images, and images from local disk, such as the camera roll.
 * @noInheritDoc
 */
export class Image extends React.Component<ImageProps, {}> {
  public static get resizeMode() {
    return {
      contain: 'contain' as const,
      cover: 'cover' as const,
      stretch: 'stretch' as const,
      center: 'center' as const,
      repeat: 'repeat' as const, // iOS Only
    };
  }

  public static prefetch = prefetch;

  public static getSize(
    url: any,
    success: (width: number, height: number) => void,
    failure: (err: typeof Error) => void,
  ) {
    if (typeof url !== 'string') {
      throw new TypeError('Image.getSize first argument must be a string url');
    }
    const size = getSize(url);
    if (typeof success === 'function') {
      size.then((result: Size | any) => success(result.width, result.height));
    }
    if (typeof failure === 'function') {
      size.catch(failure);
    } else {
      size.catch((err: Error) => warn(`Failed to get size for image: ${url}`, err));
    }
    return size;
  }

  public render() {
    const {
      children,
      style,
      imageStyle,
      imageRef,
      source,
      sources,
      src,
      srcs,
      tintColor,
      tintColors,
      ...restProps
    } = this.props;

    const nativeProps = { ...restProps } as ImageProps;
    // Define the image source url array.
    const imageUrls: string[] = this.getImageUrls({ src, srcs, source, sources });

    // Set sources props by platform specification
    if (Device.platform.OS === Platform.ios) {
      if (imageUrls.length) {
        nativeProps.source = imageUrls.map(uri => ({ uri }));
      }
    } else if (Device.platform.OS === Platform.android) {
      if (imageUrls.length === 1) {
        [nativeProps.src] = imageUrls;
      } else if (imageUrls.length > 1) {
        nativeProps.srcs = imageUrls;
      }
    }

    /**
     * defaultSource prop
     */
    if (typeof nativeProps.defaultSource === 'string') {
      if (nativeProps.defaultSource.indexOf('data:image/') !== 0) {
        warn('[Image] defaultSource prop must be a local base64 image');
      }
      nativeProps.defaultSource = convertImgUrl(nativeProps.defaultSource);
    }

    /**
     * tintColor(s)
     */
    const nativeStyle =  StyleSheet.flatten(style);
    this.handleTintColor(nativeStyle, tintColor, tintColors);
    nativeProps.style = nativeStyle;

    if (children) {
      return (
        <View style={style}>
          <img
            {...nativeProps}
            nativeName="Image"
            alt=""
            // @ts-ignore
            ref={imageRef}
            // @ts-ignore
            style={[{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              width: nativeStyle.width,
              height: nativeStyle.height,
            }, imageStyle]}
          />
          {children}
        </View>
      );
    }
    return (
      // @ts-ignore
      <img
        {...nativeProps}
        nativeName="Image"
        alt=""
        ref={imageRef as LegacyRef<HTMLImageElement>}
      />
    );
  }

  private getImageUrls({ src, srcs, source, sources }: {
    src: string | any,
    srcs: string[] | any,
    source: string | any,
    sources: string[] | any,
  }) {
    let imageUrls: string[] = [];
    if (typeof src === 'string') {
      imageUrls.push(src);
    }
    if (Array.isArray(srcs)) {
      imageUrls = [...imageUrls, ...srcs];
    }
    if (source) {
      if (typeof source === 'string') {
        imageUrls.push(source);
      } else if (typeof source === 'object' && source !== null) {
        const { uri } = source as ImageSource;
        if (uri) {
          imageUrls.push(uri);
        }
      }
    }
    if (sources) {
      if (Array.isArray(sources)) {
        sources.forEach((imageSrc) => {
          if (typeof imageSrc === 'string') {
            imageUrls.push(imageSrc);
          } else if (typeof imageSrc === 'object' && imageSrc !== null && imageSrc.uri) {
            imageUrls.push(imageSrc.uri);
          }
        });
      }
    }

    if (imageUrls.length) {
      imageUrls = imageUrls.map((url: string) => convertImgUrl(url));
    }
    return imageUrls;
  }

  private handleTintColor(
    nativeStyle: HippyTypes.Style,
    tintColor?: HippyTypes.tintColor,
    tintColors?: HippyTypes.tintColors,
  ) {
    if (tintColor) {
      Object.assign(nativeStyle, {
        tintColor,
      });
    }
    if (tintColors && Array.isArray(tintColors)) {
      Object.assign(nativeStyle, {
        tintColors,
      });
    }
  }
}

export const ImageBackground = Image;

export default Image;
